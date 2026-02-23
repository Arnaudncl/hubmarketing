import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sql from 'mssql/msnodesqlv8.js';
import { XMLParser } from 'fast-xml-parser';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://127.0.0.1:5173,http://127.0.0.1:5174,http://localhost:5173,http://localhost:5174';

const dbConfig = {
  connectionString:
    process.env.SAGE_CONNECTION_STRING ||
    'Driver={SQL Server};Server=SRV-SAGE\\SAGE;Database=House;Trusted_Connection=Yes;',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
};

const TABLE_PRODUCTS = process.env.SAGE_TABLE_PRODUCTS || 'F_ARTICLE';
const TABLE_STOCK = process.env.SAGE_TABLE_STOCK || 'F_STOCK';
const TABLE_SALES_LINES = process.env.SAGE_TABLE_SALES_LINES || 'F_DOCLIGNE';

const PS_BASE_URL = (process.env.PS_BASE_URL || 'https://www.house-store.com/api').replace(/\/+$/, '');
const PS_API_KEY = process.env.PS_API_KEY || '';

const allowedOrigins = CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
}));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'HubMarketing API',
    docs: [
      '/api/sage/health',
      '/api/prestashop/health',
      '/api/unified/overview?limit=100',
    ],
  });
});

let pool;

async function getPool() {
  if (pool?.connected) return pool;
  pool = await sql.connect(dbConfig);
  return pool;
}

async function runQuery(query, params = {}) {
  const p = await getPool();
  const req = p.request();
  Object.entries(params).forEach(([k, v]) => req.input(k, v));
  const result = await req.query(query);
  return result.recordset;
}

function psHeaders() {
  const auth = Buffer.from(`${PS_API_KEY}:`).toString('base64');
  return {
    Authorization: `Basic ${auth}`,
    Accept: 'application/xml',
  };
}

async function psGet(path, query = {}) {
  if (!PS_API_KEY) {
    throw new Error('PS_API_KEY is missing. Add it in server/.env');
  }

  const url = new URL(`${PS_BASE_URL}/${path.replace(/^\/+/, '')}`);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });

  const response = await fetch(url, { headers: psHeaders() });
  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`PrestaShop ${response.status}: ${raw.slice(0, 300)}`);
  }

  const trimmed = raw.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }
  return parser.parse(raw);
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function scheduleSelfRestartWindows() {
  const cmd = [
    'Start-Sleep -Seconds 1;',
    `Start-Process -FilePath '${process.execPath}' -ArgumentList '${path.join(__dirname, 'index.js')}' -WorkingDirectory '${__dirname}' -WindowStyle Hidden;`
  ].join(' ');
  const child = spawn('powershell.exe', ['-NoProfile', '-Command', cmd], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();
}

async function gracefulShutdown(exitCode = 0) {
  try {
    if (pool?.connected) await pool.close();
  } catch {
    // ignore close errors
  } finally {
    process.exit(exitCode);
  }
}

app.get('/api/system/backend/status', (_req, res) => {
  res.json({
    ok: true,
    pid: process.pid,
    uptimeSec: Math.floor(process.uptime()),
    startedAt: new Date(Date.now() - Math.floor(process.uptime() * 1000)).toISOString(),
    platform: process.platform,
  });
});

app.post('/api/system/backend/stop', (_req, res) => {
  res.json({ ok: true, action: 'stop', message: 'Backend stopping...' });
  setTimeout(() => gracefulShutdown(0), 250);
});

app.post('/api/system/backend/restart', (_req, res) => {
  if (process.platform !== 'win32') {
    res.status(400).json({ ok: false, action: 'restart', message: 'Auto-restart endpoint is only enabled on Windows.' });
    return;
  }

  try {
    scheduleSelfRestartWindows();
    res.json({ ok: true, action: 'restart', message: 'Backend restarting...' });
    setTimeout(() => gracefulShutdown(0), 300);
  } catch (error) {
    res.status(500).json({ ok: false, action: 'restart', message: error.message });
  }
});

app.get('/api/sage/health', async (_req, res) => {
  try {
    const rows = await runQuery('SELECT @@SERVERNAME AS serverName, DB_NAME() AS databaseName');
    res.json({ ok: true, ...rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'sage', message: error.message });
  }
});

app.get('/api/sage/products', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 200), 1000);
    const rows = await runQuery(`SELECT TOP (${limit}) * FROM ${TABLE_PRODUCTS} ORDER BY 1 DESC`);
    res.json({ ok: true, count: rows.length, rows });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'sage', message: error.message });
  }
});

app.get('/api/sage/stock', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 500), 2000);
    const rows = await runQuery(`SELECT TOP (${limit}) * FROM ${TABLE_STOCK} ORDER BY 1 DESC`);
    res.json({ ok: true, count: rows.length, rows });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'sage', message: error.message });
  }
});

app.get('/api/sage/sales', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 500), 2000);
    const rows = await runQuery(`SELECT TOP (${limit}) * FROM ${TABLE_SALES_LINES} ORDER BY 1 DESC`);
    res.json({ ok: true, count: rows.length, rows });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'sage', message: error.message });
  }
});

app.get('/api/prestashop/health', async (_req, res) => {
  try {
    const data = await psGet('');
    const resources = toArray(data?.prestashop?.api?.children?.api || data?.api || []);
    res.json({ ok: true, baseUrl: PS_BASE_URL, resources: resources.length || null });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/prestashop/products', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 300), 5000);
    const data = await psGet('products', {
      output_format: 'JSON',
      display: 'full',
      limit: `0,${limit}`,
      sort: '[id_DESC]',
    });

    const products = toArray(data?.prestashop?.products?.product || data?.products || []);
    res.json({ ok: true, count: products.length, rows: products });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/prestashop/combinations', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 1000), 10000);
    const data = await psGet('combinations', {
      output_format: 'JSON',
      display: 'full',
      limit: `0,${limit}`,
      sort: '[id_DESC]',
    });

    const combinations = toArray(data?.prestashop?.combinations?.combination || data?.combinations || []);
    res.json({ ok: true, count: combinations.length, rows: combinations });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/prestashop/currencies', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 200);
    const data = await psGet('currencies', {
      output_format: 'JSON',
      display: 'full',
      limit: `0,${limit}`,
      sort: '[id_DESC]',
    });

    const currencies = toArray(data?.prestashop?.currencies?.currency || data?.currencies || []);
    res.json({ ok: true, count: currencies.length, rows: currencies });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/prestashop/categories', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 2000), 10000);
    const data = await psGet('categories', {
      output_format: 'JSON',
      display: 'full',
      limit: `0,${limit}`,
      sort: '[id_ASC]',
    });
    const rows = toArray(data?.prestashop?.categories?.category || data?.categories || []);
    res.json({ ok: true, count: rows.length, rows });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/prestashop/suppliers', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 1000), 5000);
    const data = await psGet('suppliers', {
      output_format: 'JSON',
      display: 'full',
      limit: `0,${limit}`,
      sort: '[id_ASC]',
    });
    const rows = toArray(data?.prestashop?.suppliers?.supplier || data?.suppliers || []);
    res.json({ ok: true, count: rows.length, rows });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/prestashop/image/:productId/:imageId', async (req, res) => {
  try {
    if (!PS_API_KEY) throw new Error('PS_API_KEY is missing');
    const { productId, imageId } = req.params;
    const auth = Buffer.from(`${PS_API_KEY}:`).toString('base64');
    const url = `${PS_BASE_URL}/images/products/${encodeURIComponent(productId)}/${encodeURIComponent(imageId)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Presta image ${response.status}: ${txt.slice(0, 200)}`);
    }

    const arr = await response.arrayBuffer();
    const buf = Buffer.from(arr);
    const ct = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buf);
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/prestashop/orders', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 300), 3000);
    const data = await psGet('orders', {
      output_format: 'JSON',
      display: 'full',
      limit: `0,${limit}`,
      sort: '[id_DESC]',
    });

    const orders = toArray(data?.prestashop?.orders?.order || data?.orders || []);
    res.json({ ok: true, count: orders.length, rows: orders });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/prestashop/tax-rates', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 5000), 20000);
    const [taxRulesRes, taxRatesRes] = await Promise.all([
      psGet('tax_rules', {
        output_format: 'JSON',
        display: 'full',
        limit: `0,${limit}`,
      }),
      psGet('taxes', {
        output_format: 'JSON',
        display: 'full',
        limit: `0,${Math.min(limit, 5000)}`,
      }),
    ]);

    const taxRules = toArray(taxRulesRes?.prestashop?.tax_rules?.tax_rule || taxRulesRes?.tax_rules || []);
    const taxes = toArray(taxRatesRes?.prestashop?.taxes?.tax || taxRatesRes?.taxes || []);
    const taxById = new Map();
    taxes.forEach(t => {
      const id = String(t?.id || '').trim();
      if (!id) return;
      const rate = Number(t?.rate || 0);
      taxById.set(id, Number.isFinite(rate) ? rate : 0);
    });

    // id_tax_rules_group -> max tax rate found in rules for that group.
    const map = {};
    taxRules.forEach(r => {
      const gid = String(r?.id_tax_rules_group || '').trim();
      const taxId = String(r?.id_tax || '').trim();
      if (!gid || !taxId) return;
      const rate = taxById.get(taxId) || 0;
      map[gid] = Math.max(Number(map[gid] || 0), rate);
    });

    res.json({ ok: true, count: Object.keys(map).length, map });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/unified/overview', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 500);

    const [sageProducts, sageStock, psProducts, psOrders] = await Promise.all([
      runQuery(`SELECT TOP (${limit}) * FROM ${TABLE_PRODUCTS} ORDER BY 1 DESC`),
      runQuery(`SELECT TOP (${limit}) * FROM ${TABLE_STOCK} ORDER BY 1 DESC`),
      psGet('products', { output_format: 'JSON', display: 'full', limit: `0,${limit}`, sort: '[id_DESC]' }),
      psGet('orders', { output_format: 'JSON', display: 'full', limit: `0,${limit}`, sort: '[id_DESC]' }),
    ]);

    const products = toArray(psProducts?.prestashop?.products?.product || psProducts?.products || []);
    const orders = toArray(psOrders?.prestashop?.orders?.order || psOrders?.orders || []);

    res.json({
      ok: true,
      sage: {
        productsCount: sageProducts.length,
        stockCount: sageStock.length,
      },
      prestashop: {
        productsCount: products.length,
        ordersCount: orders.length,
      },
      rows: {
        sageProducts,
        sageStock,
        prestashopProducts: products,
        prestashopOrders: orders,
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'unified', message: error.message });
  }
});

app.use((err, _req, res, _next) => {
  res.status(500).json({ ok: false, message: err.message || 'Unexpected error' });
});

app.listen(PORT, () => {
  console.log(`HubMarketing API running on http://127.0.0.1:${PORT}`);
});
