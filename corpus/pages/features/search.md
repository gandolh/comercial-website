---
title: Search (FTS5, diacritics-folding)
slug: search
category: tech
tags: [search, fts5, sqlite, diacritics, ranking]
sources: 0
updated: 2026-05-29
---

# Search (FTS5, diacritics-folding)

Listing search uses SQLite **FTS5** with diacritics folding, so `"sablon"` matches `"șablon"` and
`"grafic"` matches `"grafică"`. Originated from todo `search-improvements`.

## How it works

- Migration `20260610010000_listings_fts.sql` creates a `listings_fts` virtual table over listing
  title + description with tokenizer `unicode61 remove_diacritics 2`, seeds it from existing listings,
  and installs INSERT/UPDATE/DELETE triggers so the index stays in sync automatically — no other module
  needs to know about it.
- `listings.repo.ts` `search()` splits into two paths: a filter-only Kysely query (no `q`) and an
  FTS-backed path (when `q` is present) joined back to `listings` with BM25 relevance ranking.
- Category/price filters and pagination work in both paths; `sort=relevanta` surfaces ranked results.
- Filter-only browse (no text query) keeps the original query path — no performance regression.

## Open questions

- FTS index covers title + description only — tags/category labels are not tokenized.
- BM25 weights are default (no field boosting).

## See also

- [[listing]] — the searched entity
