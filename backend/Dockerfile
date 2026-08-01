# syntax=docker/dockerfile:1
#
# Secure-by-default image for the SDDP backend. Aims to pass Hadolint clean and
# satisfy POL-02 (runs non-root). Pinned base tag; digest-pinning is the
# stronger form and a Week-3 / POL-04 hardening step.
FROM node:20.18.1-slim

WORKDIR /app

# Install production dependencies from the committed lockfile for reproducible,
# build-once artifacts (ADR-004). npm ci fails if package-lock.json is missing
# or out of sync — exactly the guarantee we want.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Application source (copied after deps so dependency layers stay cached).
COPY src ./src

# Drop to the image's built-in non-root user (uid 1000). /app stays root-owned
# and the app only reads it — no writable app dir, which also plays well with a
# read-only root filesystem later.
USER node

EXPOSE 3000
CMD ["node", "src/server.js"]
