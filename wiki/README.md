# my-olx Wiki

A persistent, compounding knowledge base for the my-olx digital-assets marketplace — maintained by Claude Code.

## How to use

| You do | Claude does |
|---|---|
| Drop a source file into `raw/` | Reads it, extracts key info, updates wiki pages |
| Ask a question | Reads `pages/index.md`, finds relevant pages, synthesizes an answer |
| Say "lint the wiki" | Checks for contradictions, orphans, gaps |

## Structure

```
raw/          ← your source documents (immutable)
  assets/     ← downloaded images
pages/        ← LLM-maintained wiki
  index.md    ← master catalog (read first)
  log.md      ← append-only event log
  overview.md ← project synthesis
  product/    ← features, rules, decisions
  market/     ← competitive analysis, research
  tech/       ← architecture, library choices, patterns
  entities/   ← domain objects: Listing, Asset, User, …
SCHEMA.md     ← conventions and workflows for Claude Code
README.md     ← this file
```

## Adding a source

1. Copy or paste the source file into `raw/` (markdown preferred; plain text works too).
2. Tell Claude: *"Ingest `wiki/raw/my-source.md`"*
3. Claude reads it, discusses takeaways, updates the wiki, logs the ingest.

## Tips

- Open `pages/` in Obsidian for the graph view and `[[link]]` navigation.
- `grep "^## \[" wiki/pages/log.md` shows all wiki events.
- Good answers to questions get filed as new pages — they compound too.
