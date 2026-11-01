# Routing: how work routes in this project
<!-- Read by the orchestrate skill. Tune freely; keep it short. -->

**Implement skill:** plan-split-dispatch, or inline for a one- or two-file change
**Review skill:** a general-purpose agent over the diff, plus the tests in `backend/` and `frontend/`
**PR skill:** propose git commands
**Issue tracker:** none. The backlog is `corpus/todo/`, one file per feature
**Code host:** GitHub, `<owner>/comercial-website`

This corpus follows its own [SCHEMA.md](SCHEMA.md), older than corpus-flow: the wiki is `pages/`, the catalog is `pages/index.md` and the log is `pages/log.md`. Moving it to corpus-flow's layout is [a todo](todo/corpus-flow-layout.md).

## Intent routing
| Signal | Intent | Route to |
|--------|--------|----------|
| New feature idea | capture | a file in `todo/`, in the format SCHEMA.md gives |
| Ready to build | build | the todo, then plan-split-dispatch |
| A shipped feature | docs | a page in `pages/features/`, then remove the todo |
| A new source document | ingest | `raw/`, never edited, then the pages it touches |
| README or docs refresh | docs | readme-docs |
| UI polish | design | impeccable, with `design/` |

## Knowledge routing: which file answers which question
| Question shape | Route to |
|---|---|
| "What is this and where does it stand?" | [pages/overview.md](pages/overview.md), then [pages/index.md](pages/index.md) |
| "How is it built?" | [pages/tech/stack.md](pages/tech/stack.md) |
| "What are the rules for listings, buying, reviews?" | [pages/product/business-rules.md](pages/product/business-rules.md) and `pages/features/` |
| "Did I get every usage?" | `grep -rnw` |
| Does a change break behaviour | the tests in `backend/` and `frontend/` |
