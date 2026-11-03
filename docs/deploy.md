# Deploying PiațăRo

The demo runs on the estate's VPS, deployed by the **vps-deploy** repo (its
`stacks/piataro.ts`). Two halves:

| Half | Where it runs | Served at |
|---|---|---|
| The frontend | static files, built on the deploy machine, served by Caddy | `https://<host>/piataro/` |
| The API | a container under the server's rootless Docker, on loopback port 8807 | `https://<host>/piataro-api/`, prefix stripped |

Caddy strips `/piataro-api`, so the API sees its own bare routes (`/health`,
`/listings`, `/auth/ward/callback`, `/uploads/...`).

## The container

`infrastructure/Dockerfile` builds the API from `backend/` (build context: the
repo root; `.dockerignore` keeps the frontend, the corpus and the designs out).
`infrastructure/docker-compose.yml` runs it as the service `piataro-api`:

- published on `127.0.0.1` only, port `PIATARO_PORT` (default 8807);
- everything it stores in `/data`, a bind mount (`PIATARO_DATA_DIR`, default
  `data/` at the repo root): the database `my-olx.db`, `uploads/` (listing
  images, served publicly) and `assets/` (the files for sale, served only
  through the download routes);
- migrations applied when the server starts;
- settings from `infrastructure/.env`, which the deploy writes and git ignores.

To run it locally, write `infrastructure/.env` with at least `JWT_SECRET`, plus
`PUBLIC_BASE_URL` and `FRONTEND_BASE_URL` for the addresses the browser will use,
then:

```bash
docker compose -f infrastructure/docker-compose.yml build piataro-api
docker compose -f infrastructure/docker-compose.yml run --rm -T piataro-api node app/dist/seed-samples.js
docker compose -f infrastructure/docker-compose.yml up -d piataro-api
curl http://127.0.0.1:8807/health        # {"status":"ok"}
```

The frontend for it is built with
`cd frontend && PIATARO_BASE=/piataro/ VITE_API_URL=/piataro-api npm run build`
and needs something in front that serves `frontend/dist` at `/piataro/` and
proxies `/piataro-api/` to port 8807 with the prefix removed, as Caddy does.

## What a deploy does

`node cli.ts piataro all`, in vps-deploy:

1. builds the frontend in this checkout's `frontend/` (run `npm install` there
   once first) with `PIATARO_BASE=/piataro/`, checks the asset paths, uploads it;
2. copies `backend/` and `infrastructure/` to the server, writes
   `infrastructure/.env` there, builds the image;
3. runs `seed-samples.js` in the new image (a rerun adds nothing);
4. runs `create-owner.js --if-missing` in the new image, with the owner's email,
   name and password sent over ssh on stdin. They are not written to the server's
   `.env` or the container's environment. An existing account is left alone, so
   a password changed in **Setări** stays changed;
5. starts the container and checks `/health` on loopback.

The container gets `JWT_SECRET`, `PUBLIC_BASE_URL` (`https://<host>/piataro-api`),
`FRONTEND_BASE_URL` (`https://<host>/piataro`), `CORS_ALLOWED_ORIGINS` and the
`WARD_OIDC_*` settings. vps-deploy's `useWard` writes the Ward settings, with
the callback at `https://<host>/piataro-api/auth/ward/callback`.

## Secrets

In vps-deploy's `secrets/piataro.env` on the deploy machine (its
`secrets/piataro.env.example` lists them):

| Key | What | Made by |
|---|---|---|
| `JWT_SECRET` | signs the API's tokens | `npm run setup` generates it |
| `WARD_OIDC_CLIENT_KEY` | the API's key at Ward | `npm run setup` generates and registers it |
| `OWNER_EMAIL`, `OWNER_NAME`, `OWNER_PASSWORD` | the one account (password at least 12 characters) | `npm run setup` asks for them |

## Resetting the owner's password

`--if-missing` never changes an existing account. To reset it, run
`create-owner.js` without the flag in the running container, with the three
values on stdin, as the deploy does:

```bash
# on the server, as the services account (its own rootless daemon), in /srv/piataro-api
export DOCKER_HOST=unix:///run/user/$(id -u)/docker.sock
docker compose -f infrastructure/docker-compose.yml exec -T piataro-api sh -c \
  'IFS= read -r OWNER_EMAIL && IFS= read -r OWNER_NAME && IFS= read -r OWNER_PASSWORD && export OWNER_EMAIL OWNER_NAME OWNER_PASSWORD && exec node app/dist/create-owner.js'
```

Then type the email, the name and the new password, one per line.

## Backups

Everything is in `/srv/piataro-api/data` on the server. The demo holds nothing
that cannot be seeded again except what the owner adds.
