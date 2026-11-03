# Routing: how work routes in this project
<!-- Read by the orchestrate skill. Tune freely; keep it short. -->

**Implement skill:** plan-split-dispatch, or inline for a one- or two-file change
**Review skill:** a general-purpose agent over the diff, plus the tests in `backend/` and `frontend/`
**PR skill:** propose git commands
**Issue tracker:** none. The queue is `corpus/briefs/todo/`; captures go in `corpus/todos/`
**Code host:** GitHub, `<owner>/comercial-website`

The corpus follows corpus-flow's layout since 2026-11-03 ([CLAUDE.md](CLAUDE.md)).

## Intent routing
| Signal | Intent | Route to |
|--------|--------|----------|
| New feature idea | capture | a file in `todos/` |
| Ready to build | build | a numbered brief in `briefs/todo/`, then plan-split-dispatch or inline |
| A brief shipped | closeout | move it to `briefs/done/` with an outcome, `log.md`, the wiki pages it changes (always `status.md`) |
| A new source document | ingest | `raw/`, never edited, then the pages it touches |
| README or docs refresh | docs | readme-docs |
| UI polish | design | impeccable, with `design/` |

## Knowledge routing: which file answers which question
| Question shape | Route to |
|---|---|
| "What is this and where does it stand?" | [wiki/overview.md](wiki/overview.md), [wiki/status.md](wiki/status.md), then [index.md](index.md) |
| "What was decided, and why?" | [wiki/decisions.md](wiki/decisions.md) |
| "How is it built?" | [wiki/stack.md](wiki/stack.md) |
| "What are the rules for listings, buying, reviews?" | [wiki/business-rules.md](wiki/business-rules.md) and the feature pages |
| "Did I get every usage?" | `grep -rnw` |
| Does a change break behaviour | the tests in `backend/` and `frontend/` |
