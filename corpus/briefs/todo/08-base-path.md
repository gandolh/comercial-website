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
