# sddp-app

Sample application source code — the workload used to demonstrate the Secure-by-Default Delivery Platform end to end.

CI/CD (scan, build, sign) is defined here. Deployment manifests live separately in `sddp-app-config` (app/config repo split), so code-change authority and deploy-change authority stay independently controllable.

## Layout

Monorepo for the first-party tiers of the demo app:

- `backend/` — Node/Express HTTP API, the middle tier (frontend → backend → db).
- `frontend/` — thin web tier that calls the backend (added once the backend pipeline is proven).

The database tier is a stock upstream image (not built here); it is admitted via the platform's trusted-registry allowlist.

## Local development (backend)

```bash
cd backend
npm install          # generates package-lock.json (commit it)
npm start            # serves on :3000 — GET /, /health, /db/ping
```

Build and run the container:

```bash
docker build -t sddp-backend:dev backend/
docker run --rm -p 3000:3000 sddp-backend:dev
```

The image runs as a non-root user by default.
