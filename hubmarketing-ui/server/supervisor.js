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

