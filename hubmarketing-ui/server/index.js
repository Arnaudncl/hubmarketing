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
const CACHE_TTL_MS = Math.max(5_000, Number(process.env.API_CACHE_TTL_MS || 120_000));
const CACHE_TTL_SHORT_MS = Math.max(3_000, Number(process.env.API_CACHE_TTL_SHORT_MS || 30_000));
const SYNC_MIN_INTERVAL_MS = Math.max(5_000, Number(process.env.SYNC_MIN_INTERVAL_MS || 20_000));
const SQL_REQUEST_TIMEOUT_MS = Math.max(3_000, Number(process.env.SQL_REQUEST_TIMEOUT_MS || 20_000));
const SQL_CONNECT_TIMEOUT_MS = Math.max(3_000, Number(process.env.SQL_CONNECT_TIMEOUT_MS || 10_000));
const SQL_POOL_MAX = Math.max(2, Number(process.env.SQL_POOL_MAX || 6));

const dbConfig = {
  connectionString:
    process.env.SAGE_CONNECTION_STRING ||
    'Driver={SQL Server};Server=SRV-SAGE\\SAGE;Database=House;Trusted_Connection=Yes;',
  connectionTimeout: SQL_CONNECT_TIMEOUT_MS,
  requestTimeout: SQL_REQUEST_TIMEOUT_MS,
  pool: {
    max: SQL_POOL_MAX,
    min: 0,
    idleTimeoutMillis: 30_000,
  },
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
};

const TABLE_PRODUCTS = process.env.SAGE_TABLE_PRODUCTS || 'F_ARTICLE';
const TABLE_STOCK = process.env.SAGE_TABLE_STOCK || 'F_STOCK';
const TABLE_SALES_LINES = process.env.SAGE_TABLE_SALES_LINES || 'F_DOCLIGNE';
const SAGE_SALES_FILTER = process.env.SAGE_SALES_FILTER || '(DO_Domaine = 0 AND DO_Type = 7)';

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
const responseCache = new Map();
const inFlightCache = new Map();
let lastSyncRunAt = 0;
let syncInProgress = false;

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

function nowMs() {
  return Date.now();
}

function makeCacheKey(prefix, value = '') {
  return `${prefix}:${value}`;
}

function cleanupCache(limit = 2000) {
  if (responseCache.size <= limit) return;
  const entries = [...responseCache.entries()].sort((a, b) => (a[1].expiresAt || 0) - (b[1].expiresAt || 0));
  const toDelete = entries.slice(0, responseCache.size - limit);
  toDelete.forEach(([k]) => responseCache.delete(k));
}

function toStableKey(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return JSON.stringify([...value]);
  if (typeof value === 'object') {
    const sorted = Object.keys(value).sort().reduce((acc, k) => {
      acc[k] = value[k];
      return acc;
    }, {});
    return JSON.stringify(sorted);
  }
  return String(value);
}

async function cachedFetch({ key, ttlMs = CACHE_TTL_MS, skipCache = false, fetcher }) {
  const current = nowMs();
  if (!skipCache) {
    const hit = responseCache.get(key);
    if (hit && hit.expiresAt > current) return hit.value;
  }
  if (inFlightCache.has(key)) return inFlightCache.get(key);
  const promise = (async () => {
    const value = await fetcher();
    if (!skipCache && ttlMs > 0) {
      responseCache.set(key, { value, expiresAt: current + ttlMs });
      cleanupCache();
    }
    return value;
  })().finally(() => {
    inFlightCache.delete(key);
  });
  inFlightCache.set(key, promise);
  return promise;
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

app.get('/api/system/cache/status', (_req, res) => {
  res.json({
    ok: true,
    cacheTtlMs: CACHE_TTL_MS,
    shortCacheTtlMs: CACHE_TTL_SHORT_MS,
    entries: responseCache.size,
    inFlight: inFlightCache.size,
    syncInProgress,
    lastSyncRunAt: lastSyncRunAt ? new Date(lastSyncRunAt).toISOString() : null,
  });
});

app.post('/api/system/cache/clear', (_req, res) => {
  responseCache.clear();
  res.json({ ok: true, message: 'Cache cleared' });
});

app.post('/api/system/sync/trigger', async (req, res) => {
  try {
    const force = req.query.force === '1' || req.query.force === 'true';
    const current = nowMs();
    if (!force && syncInProgress) {
      return res.status(202).json({ ok: true, skipped: true, reason: 'sync_in_progress' });
    }
    if (!force && current - lastSyncRunAt < SYNC_MIN_INTERVAL_MS) {
      return res.status(202).json({
        ok: true,
        skipped: true,
        reason: 'throttled',
        retryInMs: SYNC_MIN_INTERVAL_MS - (current - lastSyncRunAt),
      });
    }

    syncInProgress = true;
    lastSyncRunAt = current;
    responseCache.clear();

    await Promise.allSettled([
      cachedFetch({
        key: makeCacheKey('sage', 'health'),
        ttlMs: CACHE_TTL_SHORT_MS,
        fetcher: () => runQuery('SELECT @@SERVERNAME AS serverName, DB_NAME() AS databaseName'),
      }),
      cachedFetch({
        key: makeCacheKey('ps', 'health'),
        ttlMs: CACHE_TTL_SHORT_MS,
        fetcher: () => psGet(''),
      }),
      cachedFetch({
        key: makeCacheKey('sage/products', 'limit=1000'),
        ttlMs: CACHE_TTL_MS,
        fetcher: () => runQuery(`SELECT TOP (1000) * FROM ${TABLE_PRODUCTS} ORDER BY AR_Ref ASC`),
      }),
      cachedFetch({
        key: makeCacheKey('sage/stock', 'limit=2000'),
        ttlMs: CACHE_TTL_MS,
        fetcher: () => runQuery(`SELECT TOP (2000) * FROM ${TABLE_STOCK} ORDER BY AR_Ref ASC`),
      }),
    ]);

    return res.json({ ok: true, startedAt: new Date(current).toISOString() });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  } finally {
    syncInProgress = false;
  }
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
    const limit = Math.min(Number(req.query.limit || 5000), 50000);
    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('sage/products', req.originalUrl);
    const rows = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_MS,
      skipCache,
      fetcher: () => runQuery(`SELECT TOP (${limit}) * FROM ${TABLE_PRODUCTS} ORDER BY AR_Ref ASC`),
    });
    res.json({ ok: true, count: rows.length, rows });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'sage', message: error.message });
  }
});

app.get('/api/sage/stock', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 5000), 100000);
    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('sage/stock', req.originalUrl);
    const rows = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_MS,
      skipCache,
      fetcher: () => runQuery(`SELECT TOP (${limit}) * FROM ${TABLE_STOCK} ORDER BY AR_Ref ASC`),
    });
    res.json({ ok: true, count: rows.length, rows });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'sage', message: error.message });
  }
});

app.get('/api/sage/sales', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20000), 200000);
    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('sage/sales', req.originalUrl);
    const rows = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_SHORT_MS,
      skipCache,
      fetcher: () => runQuery(`
        SELECT TOP (${limit}) *
        FROM ${TABLE_SALES_LINES}
        WHERE ISNULL(LTRIM(RTRIM(CAST(AR_Ref AS NVARCHAR(64)))), '') <> ''
          AND ${SAGE_SALES_FILTER}
        ORDER BY cbModification DESC, DO_Date DESC, DL_No DESC
      `),
    });
    res.json({ ok: true, count: rows.length, rows });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'sage', message: error.message });
  }
});

app.post('/api/sage/sales-by-refs', async (req, res) => {
  try {
    const refsRaw = Array.isArray(req.body?.refs) ? req.body.refs : [];
    const refs = [...new Set(refsRaw.map(r => String(r || '').trim().toUpperCase()).filter(Boolean))].slice(0, 20000);
    if (refs.length === 0) return res.json({ ok: true, count: 0, map: {} });

    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('sage/sales-by-refs', toStableKey(refs));
    const map = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_SHORT_MS,
      skipCache,
      fetcher: async () => {
        const resultMap = {};
        const chunkSize = 1000; // keep under SQL parameter limits
        const p = await getPool();
        for (let offset = 0; offset < refs.length; offset += chunkSize) {
          const chunk = refs.slice(offset, offset + chunkSize);
          const request = p.request();
          const placeholders = chunk.map((ref, i) => {
            const key = `r${i}`;
            request.input(key, sql.NVarChar(64), ref);
            return `@${key}`;
          });
          const q = `
            SELECT UPPER(LTRIM(RTRIM(CAST(AR_Ref AS NVARCHAR(64))))) AS Ref,
                   SUM(CASE WHEN TRY_CONVERT(float, DL_Qte) IS NULL THEN 0 ELSE TRY_CONVERT(float, DL_Qte) END) AS Qty
            FROM ${TABLE_SALES_LINES}
            WHERE UPPER(LTRIM(RTRIM(CAST(AR_Ref AS NVARCHAR(64))))) IN (${placeholders.join(',')})
              AND ${SAGE_SALES_FILTER}
            GROUP BY UPPER(LTRIM(RTRIM(CAST(AR_Ref AS NVARCHAR(64)))))
          `;
          const result = await request.query(q);
          (result.recordset || []).forEach(r => {
            const key = String(r.Ref || '').toUpperCase();
            resultMap[key] = (resultMap[key] || 0) + Number(r.Qty || 0);
          });
        }
        return resultMap;
      },
    });
    res.json({ ok: true, count: Object.keys(map).length, map });
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
    const limit = Math.min(Number(req.query.limit || 300), 20000);
    const batchSize = Math.min(Number(req.query.batch || 1000), 1000);
    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('ps/products', req.originalUrl);
    const products = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_MS,
      skipCache,
      fetcher: async () => {
        const list = [];
        let offset = 0;
        while (list.length < limit) {
          const take = Math.min(batchSize, limit - list.length);
          const data = await psGet('products', {
            output_format: 'JSON',
            display: 'full',
            limit: `${offset},${take}`,
            sort: '[id_DESC]',
          });
          const rows = toArray(data?.prestashop?.products?.product || data?.products || []);
          if (!rows.length) break;
          list.push(...rows);
          if (rows.length < take) break;
          offset += take;
        }
        return list;
      },
    });
    res.json({ ok: true, count: products.length, rows: products });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.post('/api/prestashop/products-by-ids', async (req, res) => {
  try {
    const idsRaw = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const ids = [...new Set(idsRaw.map(v => Number(v)).filter(v => Number.isFinite(v) && v > 0))].slice(0, 2000);
    if (!ids.length) return res.json({ ok: true, count: 0, rows: [] });

    const rows = [];
    for (const id of ids) {
      try {
        const data = await psGet('products', {
          output_format: 'JSON',
          display: 'full',
          'filter[id]': `[${id}]`,
          limit: '0,1',
        });
        const arr = toArray(data?.prestashop?.products?.product || data?.products || []);
        if (arr[0]) rows.push(arr[0]);
      } catch {
        // skip invalid/inaccessible product ids
      }
    }

    res.json({ ok: true, count: rows.length, rows });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/prestashop/combinations', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 1000), 50000);
    const batchSize = Math.min(Number(req.query.batch || 1000), 1000);
    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('ps/combinations', req.originalUrl);
    const combinations = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_MS,
      skipCache,
      fetcher: async () => {
        const list = [];
        let offset = 0;
        while (list.length < limit) {
          const take = Math.min(batchSize, limit - list.length);
          const data = await psGet('combinations', {
            output_format: 'JSON',
            display: 'full',
            limit: `${offset},${take}`,
            sort: '[id_DESC]',
          });
          const rows = toArray(data?.prestashop?.combinations?.combination || data?.combinations || []);
          if (!rows.length) break;
          list.push(...rows);
          if (rows.length < take) break;
          offset += take;
        }
        return list;
      },
    });
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
    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('ps/categories', req.originalUrl);
    const rows = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_MS,
      skipCache,
      fetcher: async () => {
        const data = await psGet('categories', {
          output_format: 'JSON',
          display: 'full',
          limit: `0,${limit}`,
          sort: '[id_ASC]',
        });
        return toArray(data?.prestashop?.categories?.category || data?.categories || []);
      },
    });
    res.json({ ok: true, count: rows.length, rows });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/prestashop/suppliers', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 1000), 5000);
    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('ps/suppliers', req.originalUrl);
    const rows = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_MS,
      skipCache,
      fetcher: async () => {
        const data = await psGet('suppliers', {
          output_format: 'JSON',
          display: 'full',
          limit: `0,${limit}`,
          sort: '[id_ASC]',
        });
        return toArray(data?.prestashop?.suppliers?.supplier || data?.suppliers || []);
      },
    });
    res.json({ ok: true, count: rows.length, rows });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/prestashop/product-option-values', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 5000), 20000);
    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('ps/product-option-values', req.originalUrl);
    const rows = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_MS,
      skipCache,
      fetcher: async () => {
        const data = await psGet('product_option_values', {
          output_format: 'JSON',
          display: 'full',
          limit: `0,${limit}`,
          sort: '[id_ASC]',
        });
        return toArray(data?.prestashop?.product_option_values?.product_option_value || data?.product_option_values || []);
      },
    });
    res.json({ ok: true, count: rows.length, rows });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/prestashop/stock-availables', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 10000), 50000);
    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('ps/stock-availables', req.originalUrl);
    const rows = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_SHORT_MS,
      skipCache,
      fetcher: async () => {
        const data = await psGet('stock_availables', {
          output_format: 'JSON',
          display: 'full',
          limit: `0,${limit}`,
          sort: '[id_ASC]',
        });
        return toArray(data?.prestashop?.stock_availables?.stock_available || data?.stock_availables || []);
      },
    });
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
    const limit = Math.min(Number(req.query.limit || 5000), 50000);
    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('ps/orders', req.originalUrl);
    const orders = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_SHORT_MS,
      skipCache,
      fetcher: async () => {
        const data = await psGet('orders', {
          output_format: 'JSON',
          display: 'full',
          limit: `0,${limit}`,
          sort: '[id_DESC]',
        });
        return toArray(data?.prestashop?.orders?.order || data?.orders || []);
      },
    });
    res.json({ ok: true, count: orders.length, rows: orders });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.post('/api/prestashop/sales-by-refs', async (req, res) => {
  try {
    const refsRaw = Array.isArray(req.body?.refs) ? req.body.refs : [];
    const refs = [...new Set(refsRaw.map(r => String(r || '').trim().toUpperCase()).filter(Boolean))].slice(0, 20000);
    if (refs.length === 0) return res.json({ ok: true, count: 0, map: {} });

    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('ps/sales-by-refs', toStableKey(refs));
    const map = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_SHORT_MS,
      skipCache,
      fetcher: async () => {
        const resultMap = {};
        const chunkSize = 250; // avoid overly long query strings to Presta
        for (let offset = 0; offset < refs.length; offset += chunkSize) {
          const chunk = refs.slice(offset, offset + chunkSize);
          const filter = `[${chunk.join('|')}]`;
          const data = await psGet('order_details', {
            output_format: 'JSON',
            display: 'full',
            'filter[product_reference]': filter,
            limit: '0,50000',
          });
          const rows = toArray(data?.prestashop?.order_details?.order_detail || data?.order_details || []);
          rows.forEach(r => {
            const ref = String(r.product_reference || '').trim().toUpperCase();
            if (!ref) return;
            const qty = Number(r.product_quantity || r.quantity || 0) || 0;
            resultMap[ref] = (resultMap[ref] || 0) + Math.max(0, qty);
          });
        }
        return resultMap;
      },
    });

    res.json({ ok: true, count: Object.keys(map).length, map });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/prestashop/tax-rates', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 5000), 20000);
    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('ps/tax-rates', req.originalUrl);
    const map = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_MS,
      skipCache,
      fetcher: async () => {
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
        const resultMap = {};
        taxRules.forEach(r => {
          const gid = String(r?.id_tax_rules_group || '').trim();
          const taxId = String(r?.id_tax || '').trim();
          if (!gid || !taxId) return;
          const rate = taxById.get(taxId) || 0;
          resultMap[gid] = Math.max(Number(resultMap[gid] || 0), rate);
        });
        return resultMap;
      },
    });

    res.json({ ok: true, count: Object.keys(map).length, map });
  } catch (error) {
    res.status(500).json({ ok: false, source: 'prestashop', message: error.message });
  }
});

app.get('/api/unified/overview', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const skipCache = req.query.nocache === '1';
    const cacheKey = makeCacheKey('unified/overview', req.originalUrl);
    const payload = await cachedFetch({
      key: cacheKey,
      ttlMs: CACHE_TTL_SHORT_MS,
      skipCache,
      fetcher: async () => {
        const [sageProducts, sageStock, psProducts, psOrders] = await Promise.all([
          runQuery(`SELECT TOP (${limit}) * FROM ${TABLE_PRODUCTS} ORDER BY 1 DESC`),
          runQuery(`SELECT TOP (${limit}) * FROM ${TABLE_STOCK} ORDER BY 1 DESC`),
          psGet('products', { output_format: 'JSON', display: 'full', limit: `0,${limit}`, sort: '[id_DESC]' }),
          psGet('orders', { output_format: 'JSON', display: 'full', limit: `0,${limit}`, sort: '[id_DESC]' }),
        ]);

        const products = toArray(psProducts?.prestashop?.products?.product || psProducts?.products || []);
        const orders = toArray(psOrders?.prestashop?.orders?.order || psOrders?.orders || []);

        return {
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
        };
      },
    });
    res.json(payload);
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
