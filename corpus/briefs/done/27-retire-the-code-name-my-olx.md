# Task 27: Retire the code name my-olx

**Depends on:** [brief 26](../done/26-rename-the-product-to-mercatus.md), which made Mercatus the visible name and kept
`my-olx` as the code name. **Runs before:** nothing.

## Context

The owner asked on 2026-11-23 for every appearance of `my-olx` to take the new name. Brief 26 kept the code name on
purpose and said renaming it "can come later as its own brief": this is that brief. It also covers
[todos/the-legal-pages-show-the-code-name.md](../../todos/the-legal-pages-show-the-code-name.md).

`git grep -n -i "my-olx"` lists the places:
- user-facing text: the legal pages (Despre, Termeni, Confidențialitate, Contact, Cookies, Ajutor), the two locale
  titles "Despre my-olx" / "About my-olx", and the new-message email's subject, heading and footer (`lib/email.ts`);
- the contact addresses on those pages (`suport@`, `legal@`, `privacy@`, `hello@my-olx.ro`);
- identifiers: the package `@my-olx/app`, the backend project `my-olx-backend` and its lockfile, the database file
  `my-olx.db` (config default, `.env.example`, Dockerfile, compose file), the test temp-dir prefix `my-olx-test-`;
- comments, the docs, the README and the corpus pages that say what the code name is.

## Decisions

- **Mercatus everywhere `my-olx` stood**, lower case where it is an identifier: `@mercatus/app`, `mercatus-backend`,
  `mercatus.db`, `mercatus-test-`. In prose and on screen it is written Mercatus.
- **The addresses become `@mercatus.example`** (owner, 2026-11-23). `mercatus.ro` is a live domain with mail that
  belongs to someone else, so it is out. `.example` is reserved and delivers nowhere; the Contact page says the
  addresses are examples for the demo.
- **Unchanged:** `/piataro/` and `/piataro-api`, vps-deploy's `piataro` stack, the container and the `PIATARO_*`
  variables, the repo name, and bare "OLX" where it names the competitor or the project's history.
- **The database file is renamed, so the box's file must move first.** The image and the compose file open
  `/data/mercatus.db`. A database already on the server at `/data/my-olx.db` has to be renamed before the next
  deploy, or the API starts on an empty file (the old one stays where it was). That is an owner step.

## Files you OWN

Every file the grep lists outside the history below, `frontend/e2e/rename.spec.ts`, and the corpus pages:
[wiki/decisions.md](../../wiki/decisions.md) (a new entry), [wiki/glossary.md](../../wiki/glossary.md),
[wiki/status.md](../../wiki/status.md), [log.md](../../log.md), the todo above.

## Files you must NOT touch

History: briefs in `done/`, old log entries, `raw/`, `orchestration/`, the promoted fold-core todo. vps-deploy is
another repo: its `stacks/piataro.ts` comment says "code name my-olx", which the outcome note reports.

## What to do

1. Rename the identifiers; run `npm install` in `backend/` so the lockfile and the workspace link follow, and check
   the lockfile's diff is names only.
2. Put Mercatus in the user-facing text, keeping each Romanian sentence grammatical; the addresses go to
   `@mercatus.example` with one line on Contact saying they are examples.
3. Rewrite the sentences that said the code name stays (root `CLAUDE.md`, `corpus/CLAUDE.md`, `README.md`,
   `brand.ts`, the glossary, the overview), and the docs.
4. Extend `e2e/rename.spec.ts`: no legal page shows `my-olx`.

## Acceptance

- [ ] `git grep -i my-olx` finds only history and the entries that record the rename.
- [ ] No legal page shows `my-olx`; the addresses read `@mercatus.example`; the new spec checks it.
- [ ] `npm run check` passes in both projects, the backend tests pass, and `bash corpus/lint.sh` ends clean.
- [ ] The outcome note lists the owner's steps: rename the database on the box before the deploy, `npm ci` in
      `backend/`.

---

> **Done 2026-11-23** (`de426bc`). Renamed: `@my-olx/app` → `@mercatus/app` and `my-olx-backend` → `mercatus-backend`
> (`npm install` in `backend/` changed only those four lockfile names and relinked `node_modules/@mercatus/app`);
> `my-olx.db` → `mercatus.db` in `config.ts`'s default, `config.test.ts`, `.env.example`, `infrastructure/Dockerfile`
> and `docker-compose.yml`; `my-olx-test-` → `mercatus-test-`; the `schema.ts` and `server.ts` comments. On screen:
> Despre (title, first sentence, "De ce Mercatus?"), Termeni (section 1 and four sentences), Confidențialitate (the
> defined term „Mercatus"), both locales' `title` ("Despre Mercatus", "About Mercatus"), and the new-message email's
> subject, heading and footer. Addresses: `suport@`, `legal@`, `privacy@`, `hello@mercatus.example` on Contact, Termeni,
> Confidențialitate, Cookies and Ajutor; Contact adds "Mercatus este o demonstrație, așa că adresele de mai sus sunt
> exemple: nu primesc e-mailuri." Prose: the root `CLAUDE.md`, `corpus/CLAUDE.md`, `README.md`, `brand.ts`'s comment,
> the docs, and the wiki pages glossary, overview, stack, carpathian-clear, legal-and-compliance and product-ideas;
> `docs/images/shots.md`'s scratch folder is `/tmp/mercatus-shots/`. `e2e/rename.spec.ts` gained a test over the six
> legal pages (`/termeni`, `/confidentialitate`, `/politica-cookies`, `/despre`, `/contact`, `/ajutor`) and the Contact
> address; 3/3 pass against a scratch API and Vite. `npm run check` passes (backend 229 tests, frontend 144). Skipped:
> `shell.spec.ts`'s four signed-in tests, which need a seeded dev account. Running the spec needed `npm ci` in
> `frontend/` first (its `node_modules` predated brief 21's fonts), the step `status.md` already lists. What still
> says my-olx: history (briefs in `done/`, old log entries, `orchestration/`, the promoted todos) and the entries that
> record this rename. Not changed, another repo: vps-deploy's `stacks/piataro.ts` comment says "code name my-olx"
> (and its owner-secret hints still say PiațăRo). Owner steps (`status.md`, step 8): stop `piataro-api` and move
> `/srv/piataro-api/data/my-olx.db` (and `-wal`, `-shm` if present) to `mercatus.db` before the deploy; `npm ci` in
> `backend/`.
