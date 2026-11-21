# Task 26: Rename the product to Mercatus

**Depends on:** the owner's answer on the board's ask: is the name Mercatus, or does PiațăRo stay? Run this
brief only for Mercatus. If PiațăRo stays, move this brief to `superseded/` with that note.
It also needs [brief 22](../done/22-the-roman-shell.md), which puts the name in one constant.

**Runs before:** nothing. **Runs after:** 22.

## Context

The Roman sketch uses the working name **Mercatus**, Latin for "market". Mercurius, the Roman god of trade,
shares the root. The wordmark cuts the U as V, the way Roman inscriptions do: MERCATVS. The name is written
Mercatus everywhere else: in sentences, the page title, accessible names and the locale files.

PiațăRo shows up across the frontend today, and twice in the backend:
- `index.html` (`<title>`);
- both locale files (the footer's copyright line, among others);
- the Navbar's accessible name;
- `AuthCardShell`, `LoginPage`, `SellerCard`, `EarningsSection`;
- the Ward sign-in helper's two error messages (`auth/services/ward.ts`);
- the legal pages: Termeni, Confidențialitate, Despre, Contact;
- the sample files' text (`backend/app/src/seed-samples.ts`) and a comment in `backend/app/src/lib/payout-fee.ts`.

`grep -rn "PiațăRo" frontend/src frontend/public frontend/index.html backend/app/src` lists them.

## Decisions

- **Only the visible name changes.** These stay: the code name `my-olx` and the `@my-olx/*` packages, the
  repo name, the base path `/piataro/` and the API's `/piataro-api`, vps-deploy's `piataro` stack, the
  container and the database. Renaming those is a deploy change with redirects, and it can come later as its
  own brief.
- **The legal pages name the demo's operator** as they do today, with the new product name wherever the old
  one stood. No new legal text.
- **The Ward client's display name** is in Ward's own client registry, so it is an owner step and goes in
  the outcome note. This repo only changes what it prints itself.

## Files you OWN

- The brand name constant from brief 22, `frontend/index.html`, both locale files, and every frontend file the
  grep lists.
- `backend/app/src/seed-samples.ts` (the sample file's line) and the comment in `backend/app/src/lib/payout-fee.ts`.
- `README.md` (the title and the product name), the root `CLAUDE.md` and `corpus/CLAUDE.md`, where they say
  what the UI shows.
- Corpus: [wiki/decisions.md](../../wiki/decisions.md) (the rename: the date, what was rejected and why),
  [wiki/glossary.md](../../wiki/glossary.md) (Mercatus, displacing PiațăRo as the product name),
  [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- `backend/`, except one line: the sample files' text in `backend/app/src/seed-samples.ts`
  ("Fișier demonstrativ PiațăRo ..."), which users download, takes the new name. The fee comment in
  `lib/payout-fee.ts` may follow. `infrastructure/`, `seed-data/`, the base path and the package names stay.
- History: briefs in `done/`, old log entries, `raw/`.

## What to do

1. Set the constant to Mercatus. Set the wordmark's lettering to MERCATVS and its accessible name to
   "Mercatus, acasă".
2. Replace the name in the `<title>`, the locale files and every file the grep lists, keeping the sentence
   around it grammatical in Romanian and English.
3. The docs and the corpus pages above.
4. Run the grep again: what it still finds should only be history, and the outcome note lists it.

## Acceptance

- [ ] The grep finds PiațăRo in no shipped file. Samples already seeded keep their old file text until
      `npm run seed:samples` reruns, and the outcome note says so.
- [ ] The tab title, the footer line, the sign-in card and the legal pages say Mercatus. The wordmark reads
      MERCATVS, and its accessible name is "Mercatus, acasă".
- [ ] The URLs are unchanged: `/piataro/` still serves, and every Playwright spec passes as before.
- [ ] The outcome note lists the owner's steps: the Ward client's display name, and any outside page that names
      the demo.
- [ ] `npm run check` passes and `bash corpus/lint.sh` ends clean.

---

> **Done 2026-11-21.** The owner picked Mercatus on 2026-11-21. `BRAND` is `{ name: "Mercatus", lettering: "MERCATVS" }`, so the wordmark reads MERCATVS with the accessible name "Mercatus, acasă", and the auth card's name follows it. Replaced, keeping each sentence grammatical: the `<title>`, `footer.copyright` (ro and en), the Ward helper's two messages, the login card's line, Termeni, Confidențialitate and Contact ("SC Mercatus SRL"), Despre's demo panel, `SellerCard`'s fallbacks ("Autor Mercatus", "Vânzător Mercatus"), `EarningsSection`'s line and comment, the sample files' text in `seed-samples.ts` and the fee comment in `lib/payout-fee.ts`. The grep (`frontend/src frontend/public frontend/index.html backend/app/src`) now finds PiațăRo nowhere; what still names it is history (briefs, the log, `raw/`, the board's copies under `design/`, the comps, `carpathian-clear.*`) and the new glossary and decision entries that say it was the name. Docs: `README.md` (title, product name; its five images retaken on a samples-only database by `docs/images/shots.md`, which now says 2026-11-21), the root `CLAUDE.md` and `corpus/CLAUDE.md`; beyond the brief's list, the titles and first lines of `docs/README.md`, `deploy.md`, `architecture.md` and `getting-started.md`, which named the product. Unchanged on purpose: `my-olx`, `@my-olx/*`, `/piataro/` and `/piataro-api`, the `piataro` stack, cookie names and the Ward client id. A build with `PIATARO_BASE=/piataro/` still serves every asset from `/piataro/`. `e2e/rename.spec.ts` (new) checks the tab title, the wordmark's text and name, the footer, the sign-in card and four legal pages; `e2e/shell.spec.ts` passes at 360 signed in with the longer MERCATVS. One correction to the brief: rerunning `npm run seed:samples` does not rewrite sample files that exist (`writeIfMissing`), so the ZIPs already on the server keep the old line until they are deleted; the ZIP stays the same size (its text is padded to 64 KB). Owner steps (in `status.md`, step 7): the Ward client's display name in Ward's registry; delete `/srv/piataro-api/data/assets/samples/*/*.zip` so the deploy writes them again; rename the demo on any outside page. Found and captured as a todo, not changed: the legal pages still use the code name my-olx as the platform's name (`todos/the-legal-pages-show-the-code-name.md`).
