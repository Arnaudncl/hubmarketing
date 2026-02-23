import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPERVISOR_PORT = Number(process.env.SUPERVISOR_PORT || 4010);
const API_PORT = Number(process.env.PORT || 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://127.0.0.1:5173,http://127.0.0.1:5174,http://localhost:5173,http://localhost:5174';
const allowedOrigins = CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
}));
app.use(express.json());

let backendProc = null;
let startedAt = null;

function isRunning() {
  return !!backendProc && !backendProc.killed;
}

function startBackend() {
  if (isRunning()) return { ok: true, message: 'Backend already running' };
  backendProc = spawn(process.execPath, [path.join(__dirname, 'index.js')], {
    cwd: __dirname,
    detached: false,
    stdio: 'ignore',
    windowsHide: true,
    env: { ...process.env, PORT: String(API_PORT) },
  });
  startedAt = new Date();
  backendProc.on('exit', () => {
    backendProc = null;
    startedAt = null;
  });
  return { ok: true, message: 'Backend started' };
}

function stopBackend() {
  if (!isRunning()) return { ok: true, message: 'Backend already stopped' };
  try {
    backendProc.kill('SIGTERM');
  } catch {
    // ignore
  }
  backendProc = null;
  startedAt = null;
  return { ok: true, message: 'Backend stopped' };
}

const CONTROL_HTML = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>HubMarketing - Contrôle Backend</title>
  <style>
    body{font-family:Segoe UI,Arial,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:28px}
    .card{max-width:620px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:14px;padding:20px}
    h1{font-size:20px;margin:0 0 10px}
    .status{font-size:14px;margin:0 0 18px;color:#93c5fd}
    .row{display:flex;gap:10px;flex-wrap:wrap}
    button{border:0;border-radius:10px;padding:10px 14px;font-weight:600;cursor:pointer}
    .start{background:#16a34a;color:#fff}
    .stop{background:#dc2626;color:#fff}
    .restart{background:#2563eb;color:#fff}
    .open{background:#334155;color:#fff}
    .log{margin-top:14px;font-size:13px;color:#cbd5e1;min-height:18px}
    code{background:#0b1220;padding:2px 6px;border-radius:6px}
  </style>
</head>
<body>
  <div class="card">
    <h1>Contrôle Backend HubMarketing</h1>
    <div id="status" class="status">Chargement...</div>
    <div class="row">
      <button class="start" onclick="act('start')">Démarrer</button>
      <button class="stop" onclick="act('stop')">Arrêter</button>
      <button class="restart" onclick="act('restart')">Redémarrer</button>
      <button class="open" onclick="window.open('http://127.0.0.1:5174','_blank')">Ouvrir UI</button>
    </div>
    <div class="log" id="log"></div>
    <p style="margin-top:16px;font-size:12px;color:#94a3b8">
      API: <code>http://127.0.0.1:${API_PORT}</code> · Superviseur: <code>http://127.0.0.1:${SUPERVISOR_PORT}</code>
    </p>
  </div>
  <script>
    const statusEl = document.getElementById('status');
    const logEl = document.getElementById('log');
    async function refresh(){
      try{
        const r = await fetch('/api/supervisor/status');
        const j = await r.json();
        const b = j.backend || {};
        statusEl.textContent = b.running
          ? 'Backend EN LIGNE · PID ' + b.pid + ' · Uptime ' + Math.floor((b.uptimeSec||0)/60) + ' min'
          : 'Backend ARRÊTÉ';
        statusEl.style.color = b.running ? '#86efac' : '#fca5a5';
      }catch(e){
        statusEl.textContent = 'Superviseur indisponible';
        statusEl.style.color = '#fca5a5';
      }
    }
    async function act(action){
      logEl.textContent = 'Action: ' + action + '...';
      try{
        const r = await fetch('/api/supervisor/' + action, {method:'POST'});
        const j = await r.json();
        logEl.textContent = j.message || ('Action ' + action + ' envoyée');
      }catch(e){
        logEl.textContent = 'Erreur: ' + e.message;
      }
      setTimeout(refresh, 500);
      setTimeout(refresh, 1500);
    }
    refresh();
    setInterval(refresh, 5000);
  </script>
</body>
</html>`;

app.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(CONTROL_HTML);
});

app.get('/api/supervisor/status', (_req, res) => {
  res.json({
    ok: true,
    backend: {
      running: isRunning(),
      pid: backendProc?.pid || null,
      startedAt: startedAt ? startedAt.toISOString() : null,
      uptimeSec: startedAt ? Math.floor((Date.now() - startedAt.getTime()) / 1000) : 0,
      apiPort: API_PORT,
    },
  });
});

app.post('/api/supervisor/start', (_req, res) => {
  res.json(startBackend());
});

app.post('/api/supervisor/stop', (_req, res) => {
  res.json(stopBackend());
});

app.post('/api/supervisor/restart', (_req, res) => {
  stopBackend();
  const result = startBackend();
  res.json({ ok: true, message: result.message || 'Backend restarted' });
});

app.listen(SUPERVISOR_PORT, () => {
  console.log(`HubMarketing Supervisor on http://127.0.0.1:${SUPERVISOR_PORT}`);
});
