# comercial-website corpus — schema and conventions

This directory is the project's wiki and work tracker, maintained by the LLM. The owner curates
sources and asks questions; the LLM curates the synthesis and tracks the work. Chat evaporates;
reusable findings get folded back here. The product is **PiațăRo** (the name the UI shows); the code
name is `my-olx` (the `@my-olx/*` packages).

## Layout

```
corpus/
  CLAUDE.md      this file, the rules
  index.md       content catalog (generated: bash corpus/lint.sh --index)
  routing.md     which question goes to which layer, which skill runs what
  lint.sh        health check; --index regenerates the catalog
  log.md         chronological record, newest last, absolute dates
  todos/         captured ideas as prose (pre-spec)
  briefs/        numbered, immutable work specs: todo/ done/ superseded/
  wiki/          the synthesis pages, the actual knowledge base (flat)
  raw/           immutable source documents; read, never edited
  orchestration/ the plan and prompt of the 2026-05-29 build swarm (history)
```

## Retrieval budget (a rule, not advice)

1. Read `index.md` first and triage on the `summary:` lines.
2. Open **at most 2–3 wiki pages**. Needing more means a page must split or a summary is not sharp.
3. Never read `briefs/` or `todos/` wholesale. `wiki/status.md` has a line per brief.

## Project invariants (checked when grilling a brief)

- **A deployed demo, not a live shop** (owner, 2026-11-03): fake payments only, no Stripe, no live
  ANAF. Only the owner signs in; the public browses read-only. See [wiki/decisions.md](wiki/decisions.md).
- **Romanian UI with correct diacritics** (ă, â, î, ș, ț); prices in RON.
- **Exact version pins** in every `package.json`.
- **No GitHub Actions or other hosted CI.** Checks run locally.
- Commit messages here are conventional (`docs:`, `feat:`, `fix:`, `chore:`), unlike the owner's
  newer repos.

## Conventions

- Every wiki page opens with exactly two frontmatter keys, `summary:` (what question the page answers,
  written for an agent deciding whether to open it) and `updated:` (absolute date). `index.md` is
  generated from them; never hand-maintain it.
- Standard relative markdown links, never `[[wikilinks]]`. Code refs from `wiki/` are `../../backend/…`.
- One concept per file; split a page past about 200 body lines (`lint.sh` fails on it).
- Brief numbers are stable for the life of the file. A brief in `done/` or `superseded/` is immutable
  (an outcome note is added at move time only). New work is a new brief.
- A decision is recorded only if it is hard to reverse, surprising without context, and a genuine
  trade-off: the call, the date, what was rejected and why.
- Glossary entries are definitions only, each with the synonyms it displaces.
- Other projects are named, never pathed (no `../other-repo`, no machine paths).

## Source-of-truth ordering

1. The actual code wins over any wiki claim. The root `CLAUDE.md` was rewritten against the code on
   2026-11-03, and the stale `backend/app/CONTRACT.md` removed; the route modules are the contract.
2. A brief in `done/` wins over `wiki/` if the wiki has not caught up.
3. `wiki/decisions.md` wins over `wiki/status.md` for choices not formally revisited.
4. Verify any path or function a page names before acting on it.

## Workflow

Capture → `todos/`. Promote → `briefs/todo/NN-slug.md`. Build → move the brief to `briefs/done/` with
an outcome note, append a `log.md` entry, fold durable findings into `wiki/` (always `status.md`).
