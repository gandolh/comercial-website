# Task 09 — Deploy: the API as a container and the vps-deploy stack

## Context
PiațăRo has no deploy. The estate deploys with vps-deploy; brief-board's `stacks/brief-board.ts` is the
template: a `WebServiceStack` with a Vite client at a base path, a Fastify + SQLite API in a container
behind `apiPrefix`, `useWard`, persistent state for the database, secrets in `secrets/<stack>.env`.

## Files you OWN
In this repo: `infrastructure/` (a Dockerfile for the backend and a `docker-compose.yml` publishing on
loopback), `.dockerignore`, `docs/`. In vps-deploy: a new `stacks/piataro.ts`, its registration in
`app.ts` and `scripts/rollout.ts`, its secrets template, and a corpus note. Do not touch vps-deploy's
other stacks.

## What to do
1. **Image:** Node 24 Alpine, builds the backend (better-sqlite3 is native: build on the box, as
   brief-board does), runs migrations on start, listens on a loopback port free in the estate
   (`node cli.ts --check` reports collisions). Data and uploaded files live in a bind-mounted `/data`.
2. **Stack:** `piataro`, client at `/piataro` built with `PIATARO_BASE=/piataro/`, API at `/piataro-api`,
   `useWard`, persistent `/data`, secrets `JWT_SECRET`, `OWNER_EMAIL`, `OWNER_PASSWORD`, `OWNER_NAME`,
   and the Ward client key. After the first deploy, `create-owner` and `seed:samples` run in the
   container (a setup step or documented commands).
3. Run vps-deploy's typecheck, `--check` and `synth`; commit there with a corpus note. Do not deploy.

## Acceptance
- `docker compose build` and `up` work locally, with the frontend served under `/piataro/` against it.
- vps-deploy's typecheck and `--check` pass, and the Caddyfile has the two routes.
- The owner's steps (secrets, `npm run setup` for Ward, the deploy, the two commands) are listed in
  `wiki/status.md`.

---

**Outcome (2026-11-03).** Done: `fdca5b4` here, `ba089e6` in vps-deploy. Not deployed.
- **Image:** `infrastructure/Dockerfile` builds `backend/` on Node 24 Alpine; better-sqlite3 11.7.0
  compiles there, and argon2 uses its musl prebuild. `/app` keeps backend's layout, so the
  `../../migrations` and `../../seed/samples` paths resolve. Data sits in `/data`.
  `infrastructure/docker-compose.yml` publishes `piataro-api` on `127.0.0.1:8807`.
- **Root manifest:** a root `package.json` that only delegates, because vps-deploy's
  `SourceRepo` needs one at the checkout's root.
- **Stack:** vps-deploy's `piataro` builds the client in `frontend/` with `PIATARO_BASE=/piataro/`.
  The sample seed is a `migrations` entry.
- **Owner account:** a pre-start step runs `create-owner.js --if-missing`, with the email, name and
  password on stdin over ssh, so the password is never on the box. `--if-missing` is new, so that a
  password changed in Settings survives every deploy.
- **Secrets:** `JWT_SECRET` and the Ward key come from `npm run setup`, and the `OWNER_*` values from
  its questions.
- **Checked locally:**
  - **Container:** the image built, the seed added 9 listings, `create-owner` said `created` and then
    `kept`, and `/health` answered.
  - **Through the Caddy stand-in:** a `/piataro/` build showed the page, the 9 listings and their
    images. The owner signed in, a fake purchase went through, the ZIP downloaded, and a file for
    sale answered 404 under `/uploads`.
  - **vps-deploy:** typecheck, `--check` and `synth` (both routes) passed. `piataro all --dry-run`
    walked the server phase through.
