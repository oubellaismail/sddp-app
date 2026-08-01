# syntax=docker/dockerfile:1
#
# Multi-stage build. The runtime image is DISTROLESS: only the Node runtime and
# our app — no npm, no shell, no package managers, minimal OS packages. This
# structurally removes the base image's npm-bundled CVEs (tar/minimatch/glob/…)
# and nearly all OS-package CVEs a full node:*-slim image carries, shrinks the
# attack surface, and runs as a non-root user (satisfies POL-02).
# Node 22 = current active LTS (Node 20 is reaching end-of-life).
#
# Base images are tag-pinned here; digest-pinning is the stronger form and a
# POL-04 / Week-3 hardening step.

# --- build: install production deps from the committed lockfile (build-once, ADR-004).
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- runtime: distroless Node, non-root (uid 65532), no shell / package managers.
FROM gcr.io/distroless/nodejs22-debian12:nonroot
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY src ./src
USER nonroot
EXPOSE 3000
# The distroless nodejs image's ENTRYPOINT is `node`; CMD is the script it runs.
CMD ["/app/src/server.js"]
