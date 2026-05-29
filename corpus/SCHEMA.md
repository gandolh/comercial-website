# Corpus Schema — my-olx

This file governs how the corpus is maintained. Read it before creating or updating any page.

## What this is

A persistent, compounding knowledge base for the my-olx project. The LLM writes and maintains all pages in `pages/`; you read them. Raw source documents go in `raw/` and are never edited.

## Directory layout

```
corpus/
  SCHEMA.md           ← this file (LLM instructions + conventions)
  raw/                ← immutable source documents; LLM reads, never writes
    assets/           ← locally downloaded images referenced by sources
  pages/              ← LLM-maintained wiki
    index.md          ← master catalog of all pages (always update on changes)
    log.md            ← append-only chronological event log
    overview.md       ← project synthesis; read this first
    product/          ← business rules, feature specs, user stories
    market/           ← market research, competitive analysis, product ideas
    tech/             ← architecture, stack decisions, design system
    entities/         ← core domain objects (Listing, Asset, User, …)
    features/         ← specs of shipped features (created when a todo is completed)
  todo/               ← feature backlog; one file per feature (3 open: stripe-webhook-signature, verify-efactura-live, creator-payouts)
    <slug>.md         ← type: add | update | remove; priority: critical/high/medium/low; status: pending/in-progress/done
```

When a todo is completed, document the shipped feature under `pages/features/` and remove the todo file
(the backlog holds only outstanding work).

## Page frontmatter (required on every page except index.md and log.md)

```yaml
---
title: Human-Readable Title
slug: kebab-case-slug
category: product | market | tech | entity | synthesis
tags: [comma, separated, lowercase]
sources: 0          # number of raw sources that contributed to this page
updated: YYYY-MM-DD
---
```

## Cross-links

- Link related pages with `[[slug]]` in the body.
- Bidirectional: if page A mentions page B, add A to B's "See also".

## Standard page structure

```
# Title

One-paragraph synthesis / TL;DR.

## [Main sections — domain-appropriate]

## Open questions

Bullet list of unresolved things.

## See also

- [[related-slug]] — one-line reason
```

## Source citations

Reference raw sources as `> Source: [filename](../raw/filename.md)`. Never paraphrase without citing.

---

## Operations

### Ingest a source

1. Read `pages/index.md` to understand existing pages.
2. Read the source document.
3. Discuss key takeaways with the user.
4. Write or update relevant pages.
5. Update `pages/index.md`.
6. Append to `pages/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | Source Title
   - Summary: …
   - Pages created: …
   - Pages updated: …
   ```

### Answer a query

1. Read `pages/index.md` to find relevant pages.
2. Read those pages.
3. Synthesize an answer with citations.
4. If the answer is substantial and reusable, file it as a new page.

### Lint the wiki

Check for:
- Contradictions between pages
- Stale claims superseded by newer sources
- Orphan pages (no inbound links)
- Concepts frequently mentioned but lacking their own page
- Missing cross-references

---

## Domain context

**What it is:** Romanian digital-assets marketplace — sellers upload downloadable files (zip, pdf, psd, mp4, …), buyers download them. No physical goods. Romanian language throughout, prices in RON.

**Categories (12, post digital-pivot):** grafica, sabloane, software, cod-sursa, audio, video, ebook, fonturi, documente, 3d, mestesugart, diverse

**Stack:** Node.js + TypeScript + Fastify + SQLite (better-sqlite3) + Kysely + React + Vite + Tailwind v4. No Docker. SQLite file at `backend/data/my-olx.db`. Uploads on disk at `backend/data/uploads/`.

**Key business rules:**
- Free tier: 5 listings/week per user
- Listings expire: 30 days
- Publishing requires ≥1 downloadable asset file
- Currency: RON; price optional (null = free)
- Romanian localization throughout; correct diacritics: ș ț ă â î (comma-below, not cedilla)

**Design system:** Carpathian Clear — primary `#0056D2`, secondary `#008B8B`, fonts Manrope + Inter, border-radius 8px.

---

## Index entry format

```
- [Title](path/from/pages/) — one-line hook | category | updated YYYY-MM-DD
```
