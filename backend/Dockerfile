# syntax=docker/dockerfile:1
#
# Multi-stage build on Chainguard's Wolfi Node images — continuously rebuilt to
# zero known CVEs, minimal (no shell / package managers in the runtime), and
# non-root by default (satisfies POL-02). This fixes the base-image OpenSSL CVEs
# that the Debian distroless base carried while its rebuild lagged, and stops
# base-image CVE churn from recurring.
#
# Pinned by digest (Chainguard's free tier is :latest-only) for reproducibility
# and to satisfy Hadolint. Refresh with:
#   docker buildx imagetools inspect cgr.dev/chainguard/node:latest
#   docker buildx imagetools inspect cgr.dev/chainguard/node:latest-dev

# --- build: install production deps from the committed lockfile (build-once, ADR-004).
FROM cgr.dev/chainguard/node@sha256:f33e85c75e96cac9c0cc934c630164b78a1600fc30a519afa26e9204352e34af AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- runtime: minimal Chainguard node, non-root (uid 65532), no shell / package managers.
FROM cgr.dev/chainguard/node@sha256:7740ce8ef7cce4b0892e85813cbb39abe48c56bd48290cb18b9ea721480263f3
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY src ./src
USER 65532
EXPOSE 3000
# The Chainguard node image's ENTRYPOINT is `node`; CMD is the script it runs.
CMD ["/app/src/server.js"]
