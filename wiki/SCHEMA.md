# Wiki Schema — my-olx

This file governs how Claude Code maintains the **my-olx wiki** — a persistent, compounding knowledge base for the digital-assets marketplace project.

## Directory layout

```
wiki/
  SCHEMA.md         ← this file (LLM instructions)
  raw/              ← immutable source documents (never edit these)
    assets/         ← locally downloaded images referenced by sources
  pages/            ← LLM-maintained wiki (Claude writes, you read)
    index.md        ← master catalog of all pages
    log.md          ← append-only chronological event log
    overview.md     ← project synthesis / executive summary
    product/        ← product decisions, features, user stories, business rules
    market/         ← competitive analysis, pricing models, market research
    tech/           ← architecture decisions, library evaluations, patterns
    entities/       ← core domain objects: Listing, Asset, User, Category, …
```

## Conventions

### Page frontmatter (every page except index.md and log.md)

```yaml
---
title: Human-Readable Title
slug: kebab-case-slug
category: product | market | tech | entity | synthesis
tags: [comma, separated]
sources: 0          # number of raw sources that contributed to this page
updated: YYYY-MM-DD
---
```

### Cross-links

- Always link to related pages with `[[slug]]` notation in the body.
- Keep links bidirectional: if page A mentions page B, add A to B's "See also" section.

### Page structure (standard)

```
# Title

One-paragraph synthesis / TL;DR.

## [Main sections — domain-appropriate]

…

## Open questions

Bullet list of things not yet resolved.

## See also

- [[related-slug]] — one-line reason for the link
```

### Source citations

- Reference raw sources as `> Source: [filename](../raw/filename.md)`.
- Never paraphrase without citing.

---

## Operations

### Ingest a source

1. Read `pages/index.md` to understand existing pages.
2. Read the source document.
3. Discuss key takeaways with the user (optional but recommended).
4. Write a summary page in `pages/` under the appropriate category.
5. Update or create entity/concept pages touched by the source.
6. Update `pages/index.md` — add the new page + any updated pages.
7. Append an entry to `pages/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | Source Title
   - Summary: what was ingested
   - Pages created: list
   - Pages updated: list
   ```

### Answer a query

1. Read `pages/index.md` to find relevant pages.
2. Read those pages.
3. Synthesize an answer with citations.
4. If the answer is substantial and reusable, file it as a new wiki page and update index + log.

### Lint the wiki

Check for:
- Contradictions between pages
- Stale claims superseded by newer sources
- Orphan pages (no inbound links)
- Important concepts mentioned but lacking their own page
- Missing cross-references
- Data gaps worth a web search

---

## Domain context for my-olx

**What it is:** Digital-assets marketplace — sellers upload downloadable files (zip, pdf, psd, mp4, …), buyers download them. No physical goods, no shipping.

**Categories:** software, grafica, sabloane, audio, video, ebook, fonturi, cod-sursa, diverse

**Key business rules:**
- Free tier: 5 listings/week per user
- Listings expire: 30 days
- Publishing requires ≥1 uploadable downloadable file
- Currency: RON; pricing optional (None = free)
- Romanian localization throughout

**Tech stack:**
- Backend: Node.js + TypeScript + Fastify; Kysely + raw SQL; JWT + Argon2; S3 (LocalStack in dev)
- Frontend: React 18 + TypeScript + Vite; React Router v7; React Query v5; Tailwind CSS v4; React Hook Form + Zod; react-i18next
- Infra: PostgreSQL 16, LocalStack (S3), MailHog — all via docker-compose

**Design system:** Carpathian Clear — primary `#0056D2`, secondary `#008B8B`, fonts Manrope + Inter, border-radius 8px.

---

## Page catalog shorthand (for index.md)

Format each entry as:
```
- [Title](path/from/pages/) — one-line hook | category | updated YYYY-MM-DD
```
