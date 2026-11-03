# PiațăRo's API (Fastify + SQLite): listings, orders, the fake payments and
# their ledger, the sign-in (password and Ward), and the downloads.
#
# Build context is the REPO ROOT, so the image can read backend/ while the
# frontend, the corpus and the designs stay out of it (.dockerignore). The
# frontend is a static site that vps-deploy builds and Caddy serves; it is not
# in this image.
#
#   docker compose -f infrastructure/docker-compose.yml up -d piataro-api
#
# The image's /app is backend/: core/ and app/ beside migrations/ and
# seed/samples/, because the built code finds those by relative path from
# app/dist (../../migrations, ../../seed/samples/previews) and the vendored
# ward-auth library at ../vendor/ward/. Migrations run when the server starts.
#
# ── Why this container runs as root ─────────────────────────────────────────
#
# On the VPS this runs under a ROOTLESS Docker daemon owned by an unprivileged
# account, where the container's uid 0 maps to that account's own uid on the
# host, so "root" here is already a normal unprivileged user out there.
#
# It has to be uid 0 because /data is a BIND MOUNT of the host's
# /srv/piataro-api/data, which holds the database and every file. Under
# rootless Docker only container-root maps back to the owning account; a
# non-root in-container user maps to a subuid the host sees as a stranger, and
# the service could not write its own database.

# ---------------------------------------------------------------------------
# deps — full workspace install, with the toolchain native modules need
# ---------------------------------------------------------------------------
FROM node:24-alpine AS deps
# better-sqlite3 11.7.0 has no prebuild for Node 24, so it compiles here.
# argon2 ships a musl prebuild and needs none of this.
RUN apk add --no-cache python3 make g++
WORKDIR /app
# Manifests first, for layer caching. Both workspace manifests are needed:
# `npm ci` checks the lockfile against every workspace the root declares.
COPY backend/package.json backend/package-lock.json backend/tsconfig.base.json ./
COPY backend/core/package.json ./core/
COPY backend/app/package.json ./app/
RUN npm ci

# ---------------------------------------------------------------------------
# builder — compile core, then app (tsc -b → core/dist, app/dist)
# ---------------------------------------------------------------------------
FROM deps AS builder
COPY backend/core ./core
COPY backend/app ./app
RUN npm run build

# ---------------------------------------------------------------------------
# proddeps — runtime dependencies only, native modules built here
# ---------------------------------------------------------------------------
FROM node:24-alpine AS proddeps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
COPY backend/core/package.json ./core/
COPY backend/app/package.json ./app/
# The root holds only dev tools (tsc, tsx, vitest), so this is core's and
# app's dependencies.
RUN npm ci --omit=dev
# Drop native build intermediates and the prebuilds for operating systems this
# image can never be. A BLACKLIST of foreign platforms on purpose: argon2
# ships its prebuilds as files under linux-x64/, and a whitelist of names
# would delete the musl one too.
RUN cd node_modules \
 && find . -name '*.o' -delete \
 && find . -type d -name obj.target -prune -exec rm -rf {} + \
 && rm -rf better-sqlite3/deps better-sqlite3/src \
 && rm -rf argon2/prebuilds/darwin-* argon2/prebuilds/win32-* argon2/prebuilds/freebsd-*

# ---------------------------------------------------------------------------
# prod — slim runtime: no compiler, no test code, no TypeScript
# ---------------------------------------------------------------------------
FROM node:24-alpine AS prod
LABEL org.opencontainers.image.title="piataro" \
      org.opencontainers.image.description="PiațăRo API: a demo marketplace for digital files"
# wget, for the healthcheck below, ships in node:alpine's busybox.
WORKDIR /app
COPY --from=proddeps /app/node_modules ./node_modules
COPY backend/package.json ./
# node_modules/@my-olx/core is a symlink to ../core, so core must sit at
# /app/core with its manifest and compiled output.
COPY backend/core/package.json ./core/
COPY --from=builder /app/core/dist ./core/dist
COPY backend/app/package.json ./app/
COPY --from=builder /app/app/dist ./app/dist
COPY backend/app/vendor ./app/vendor
COPY backend/migrations ./migrations
# The sample listings' preview images, read by seed-samples.js.
COPY backend/seed/samples ./seed/samples
# tsc compiles src/**/*, the test helpers and the dev seed with it. The dev
# seed reads backend/seed/dev, which is not in the image, and refuses to run
# outside development anyway.
RUN find ./app/dist ./core/dist \( -name '*.test.*' -o -name 'test-app.*' -o -name 'seed-dev.*' \) -delete
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8807 \
    LOG_LEVEL=info \
    DATABASE_PATH=/data/my-olx.db \
    UPLOADS_DIR=/data/uploads \
    ASSETS_DIR=/data/assets
# The database, the public uploads (listing images) and the files for sale. A
# BIND MOUNT on the VPS (the host's /srv/piataro-api/data), so it survives
# every deploy.
VOLUME /data
EXPOSE 8807
# Shell form, so it follows the runtime PORT rather than a baked constant.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" || exit 1
CMD ["node", "app/dist/server.js"]
