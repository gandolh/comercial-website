---
title: Move the corpus to corpus-flow's layout
slug: corpus-flow-layout
category: tech
tags: [corpus, docs]
type: update
priority: low
status: pending
updated: 2026-10-31
---

# Move the corpus to corpus-flow's layout

The owner's other repos keep their corpus in the layout of the corpus-flow skill (`<owner>/my-personal-skills`): `corpus/CLAUDE.md`, a generated `index.md`, `routing.md`, `lint.sh`, `log.md`, `todos/`, `briefs/todo|done|superseded/` and `wiki/` pages with `summary:` and `updated:` frontmatter. This corpus predates it and follows [SCHEMA.md](../SCHEMA.md). On 2026-10-31 only `routing.md` was added, because the rest moves every page.

## What the move would change

- `pages/*` to `wiki/`, flattened or kept in subfolders, and every link to them in `CLAUDE.md`, `README.md`, `docs/` and the pages themselves.
- Each page's frontmatter gains `summary:` (what question the page answers) and keeps `updated:`; `title`, `slug`, `category`, `tags` and `sources` can stay or go.
- `pages/index.md` becomes `index.md` with a generated catalog; `pages/log.md` becomes `log.md`.
- `todo/` becomes `todos/`, and a todo picked up for work becomes a numbered brief.
- `raw/` and `orchestration/` stay; corpus-flow has no rule against them.

## Acceptance

The owner says yes or no. On yes: the layout above, `bash corpus/lint.sh` clean, and every relative link in the repo resolving.
