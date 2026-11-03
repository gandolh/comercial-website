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
