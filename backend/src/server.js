'use strict';

const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Lazily-created connection pool. In Week 2 there is no database yet, so this
// stays unused unless DATABASE_URL is provided. The `pg` dependency is present
// on purpose: it gives the pipeline's SCA (Dependency-Check) and image scanner
// (Trivy) a real dependency to inspect, and readies the backend->db hop from
// cluster-architecture-spec §6 (frontend -> backend -> db) for when the db
// tier lands.
let pool;
function db() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

app.get('/', (req, res) => {
  res.json({ service: 'sddp-backend', status: 'ok' });
});

// Liveness/readiness endpoint for Kubernetes probes.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Exercises the backend->db hop without requiring a database in Week 2:
// degrades gracefully when DATABASE_URL is unset.
app.get('/db/ping', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.status(200).json({ db: 'not configured' });
  }
  try {
    const { rows } = await db().query('SELECT 1 AS ok');
    res.json({ db: 'reachable', result: rows[0] });
  } catch (err) {
    res.status(503).json({ db: 'unreachable', error: err.message });
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`sddp-backend listening on :${PORT}`);
});

// Graceful shutdown so Kubernetes rolling updates drain cleanly.
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

module.exports = app;
