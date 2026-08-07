'use strict';

const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
// In-cluster address of the backend (the middle tier). Reachable ONLY because the
// frontend->backend NetworkPolicy allows it; the namespace default-deny floor
// blocks everything else. Operator-controlled config, never user input.
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:3000';

// Minimal HTML escaper. The values we render (BACKEND_URL from config, the
// backend's JSON reply from a trusted in-cluster service) are not user-supplied,
// but we escape anyway so the demo page is XSS-safe by construction rather than
// by assumption.
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Liveness/readiness for Kubernetes probes. Deliberately does NOT call the
// backend: the frontend is "healthy" if it can serve. Coupling readiness to the
// backend would make a backend blip flap the whole frontend tier.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Demo page: server-side calls the backend's /db/ping (which in turn queries the
// db), proving the front -> back -> db chain end to end. Degrades gracefully if
// the backend is unreachable (e.g. NetworkPolicy not yet applied, backend down).
app.get('/', async (req, res) => {
  let backendReply;
  try {
    const r = await fetch(`${BACKEND_URL}/db/ping`, {
      signal: AbortSignal.timeout(3000),
    });
    backendReply = await r.json();
  } catch (err) {
    backendReply = { error: err.message };
  }
  res
    .status(200)
    .type('html')
    .send(
      '<!doctype html><meta charset="utf-8"><title>SDDP frontend</title>' +
        '<h1>SDDP frontend</h1>' +
        `<p>front &rarr; back &rarr; db demo. Backend at <code>${esc(BACKEND_URL)}</code>.</p>` +
        `<pre>${esc(JSON.stringify(backendReply, null, 2))}</pre>`
    );
});

const server = app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`sddp-frontend listening on :${PORT}`);
});

// Graceful shutdown so Kubernetes rolling updates drain cleanly.
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

module.exports = app;
