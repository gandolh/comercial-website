---
title: Search Improvements (FTS, Filters, Romanian Diacritics)
slug: search-improvements
type: update
priority: medium
status: done
area: backend
updated: 2026-05-29
---

# Search Improvements

## What

Current search uses `LIKE %q%` on `title` and `description`. This is slow on large datasets, doesn't handle Romanian diacritics (searching "sablon" won't find "șablon"), and has no relevance ranking.

## Problems

1. **Diacritics folding** — `LIKE '%sablon%'` misses listings with `șablon`. Buyers who omit diacritics (common on mobile) get no results.
2. **Performance** — `LIKE %q%` can't use indexes; full table scan on every search.
3. **No relevance ranking** — results are sorted by `created_at desc` even when query is provided.
4. **No prefix matching** — searching "sablonar" won't find "șabloane".

## Options

**Option A — SQLite FTS5 (recommended):**
- SQLite has a built-in full-text search extension: FTS5
- Create a virtual FTS5 table shadowing `listings(title, description)`
- FTS5 supports: BM25 ranking, prefix queries, boolean operators
- **Diacritics:** FTS5 supports custom Unicode tokenizers; use `unicode61` tokenizer with `remove_diacritics=2` option — folds ș→s, ț→t, ă→a, â→a, î→i automatically
- Sync via triggers: `INSERT/UPDATE/DELETE` on `listings` → update FTS5 table

**Option B — In-app normalization (simpler):**
- Normalize both query and stored text to ASCII (strip diacritics) before `LIKE` comparison
- No ranking, but solves the diacritics problem cheaply
- Add a `title_normalized` column populated on insert/update

## Recommendation

Option A (FTS5) for proper ranking + diacritics. Option B as quick interim fix.

## Backend changes (Option A)

New migration:
```sql
CREATE VIRTUAL TABLE listings_fts USING fts5(
  listing_id UNINDEXED,
  title,
  description,
  tokenize = 'unicode61 remove_diacritics 2'
);
-- Sync triggers omitted for brevity
```

Update `ListingsRepository.search()`:
- Use `listings_fts` for text queries with BM25 ranking
- Fall back to regular Kysely query for filter-only searches

## Acceptance criteria

- [x] Searching "sablon" finds listings with "șablon" in title/description
- [x] Searching "grafic" finds listings with "grafică"
- [x] Results ranked by relevance when query is provided
- [x] Filter-only searches (category, price) still work without FTS
- [x] No performance regression on category browse (no text query)
