# Task 08 — Serve the frontend at /piataro and the API at /piataro-api

## Context
Decisions.md → *Served at `<domain>/piataro`*. The frontend uses TanStack Router with no base path and
reads `VITE_API_URL`; Vite has no `base`. The API serves at its root.

## Files you OWN
`frontend/vite.config.ts`, the router setup (`frontend/src/App.tsx` and the router file), every place
that builds an absolute URL (`core/lib/axios.ts`, the invoice and listing services that read
`VITE_API_URL`), asset and image URL helpers, `backend/core/src/http/` if the API needs a prefix,
`docs/getting-started.md`.

## What to do
1. **Frontend base:** `PIATARO_BASE` (default `/`) sets Vite's `base` and the router's `basepath`, so
   every route, link and asset works under `/piataro/` and at `/` in dev.
2. **API URL:** in production the frontend calls the API at `/piataro-api` (same origin; Caddy strips
   the prefix, so the API keeps its bare routes). One helper builds API URLs; remove the scattered
   `VITE_API_URL ?? "http://localhost:8080"` copies.
3. Images and downloads use the same helper, so their URLs carry `/piataro-api`.
4. Check in a browser with a local build served under `/piataro/` (a small static server and a proxy for
   `/piataro-api`).

## Acceptance
- A production build with `PIATARO_BASE=/piataro/` works under that path: home, a listing, its images,
  sign-in, a fake purchase and the download. `npm run dev` still works at `/`.
- Frontend build and lint pass.

---

**Outcome (2026-11-03).** Done (`f5f23e9`).
- **Base path:** `PIATARO_BASE` sets Vite's `base`, TanStack Router's `basepath` and the i18n load path.
- **API URL:** `core/lib/api-url.ts` (`API_BASE`, `apiUrl()`) replaces the four
  `VITE_API_URL ?? "http://localhost:8080"` copies. A production build defaults to `/piataro-api`, and
  `frontend/.env.example` no longer sets a localhost URL that a deploy build could pick up.
- **Links:** the two raw `href="/..."` anchors (cookie banner, privacy page) are router links.
- **API side:** nothing changed in the API: image URLs come from `PUBLIC_BASE_URL`, and Ward redirects
  from `FRONTEND_BASE_URL`. Both are deploy settings, documented in `docs/getting-started.md`.
- **Checked:** a `PIATARO_BASE=/piataro/` build behind a local stand-in for Caddy (static `/piataro/`
  with the single-page fallback, `/piataro-api/` proxied with the prefix stripped). Pages, links and
  sample images carried the prefixes, the owner signed in, and a download came back 200.
