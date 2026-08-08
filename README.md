# sddp-app

Sample application source code — the workload used to demonstrate the Secure-by-Default Delivery Platform end to end.

CI/CD (scan, build, sign) is defined here. Deployment manifests live separately in `sddp-app-config` (app/config repo split), so code-change authority and deploy-change authority stay independently controllable.

## Layout

Source for the backend service of the demo app:

- `backend/` — Node/Express HTTP API (the middle tier: frontend → backend → db).

The frontend is a separate service with its own repository. The database tier is a stock upstream image (not built here); it is admitted via the platform's trusted-registry allowlist.

## Secret scanning (pre-commit)

A local Gitleaks pre-commit hook catches secrets **before** they enter Git history (pipeline §3.1). Install it once per clone:

```bash
brew install pre-commit      # or: pipx install pre-commit
pre-commit install           # run from the repo root
```

From then on, every `git commit` scans the staged changes; a detected secret blocks the commit. This layer is bypassable (`--no-verify`) — the enforceable backstop is the CI Gitleaks scan on every pull request.

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
