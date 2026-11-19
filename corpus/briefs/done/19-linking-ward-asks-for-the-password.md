# Task 19: Linking Ward asks for the password

**Depends on:** nothing. **Runs after:** brief 16 (the change-password form, whose answers this follows).

**Before you start:** run `brief-board guide` ([CLAUDE.md](../../../CLAUDE.md)).

Filed 2026-11-19 by the controller under the owner's rule of 2026-11-17: an app links a Ward account to a local account only after the local password is typed again. Ward's own library got the same rule on 2026-11-19 (ward-auth 1.0.0); PiațăRo has its own link flow, so the library change does not reach it.

## Context

`backend/app/src/features/ward/routes.ts` links in two steps: `POST /auth/ward/link-ticket` (signed in, bearer) returns a single-use ticket for two minutes, then `GET /auth/ward/start?link=T` runs the Ward round trip and the callback writes `users.ward_subject`. The ticket asks only for the session, so whoever holds a signed-in tab can link their own Ward account to the owner's and sign in with it from then on.

`frontend/src/app/modules/settings/components/WardSection.tsx` has a "Leagă contul Ward" button that fetches the ticket (`fetchWardLinkTicket` in `auth/services/ward.ts`) and navigates. There is no unlink.

## Decisions

- **The ticket takes the password.** `POST /auth/ward/link-ticket` takes `{ current_password }`, the same field name and the same answers as `PATCH /users/me/password`: 422 when it is missing or empty (validation, before `authenticate`, the app's order), 403 `current password is incorrect` when it is wrong, and no ticket in either case. The start, the callback and the tickets' life stay as they are.
- **No attempt budget of its own.** `POST /auth/login` has none today; a limit on this route alone would not change what a password guesser can do. Note it in a todo (`password-checks-have-no-attempt-limit.md`: login, change password and this route; one account, a demo) for the owner to pick up or close.
- **The section asks in place.** A password field ("Parola actuală", `autocomplete="current-password"`) above the button; the button sends it. A 403 shows "Parola actuală nu este corectă." in the section (PasswordSection's wording), the field keeps focus and the page stays; any other failure shows "Nu am putut începe legarea. Încearcă din nou." (today the section shows nothing and only resets the button). Use the kit's `Input` and `Button` as `PasswordSection` does; the section's strings stay inline, as the file has them.

## Files you OWN

- `backend/app/src/features/ward/` (`routes.ts`, `routes.test.ts`)
- `frontend/src/app/modules/settings/components/WardSection.tsx`, `frontend/src/app/modules/auth/services/ward.ts`
- `frontend/e2e/` (one new spec, `fixtures.ts` only if it needs a helper)
- `corpus/` bookkeeping for this brief, `docs/` lines that describe linking Ward

## Files you must NOT touch

`backend/app/vendor/`, `vendor/`, migrations, other features' routes, lockfiles, deploy files.

## What to do

1. Server: the body schema and the password check (`verifyPassword` from `lib/tokens.ts`, as `features/users/routes.ts` does). Update the module's header comment (the route list).
2. Tests in `routes.test.ts`: no body and an empty password answer 422; a wrong password answers 403 and the ticket map stays empty (a start with any ticket still answers `expired_link`); the right password returns a ticket that links (the existing link tests send it). Each new test fails on today's code.
3. The section and the service: the field, the call with the password, the 403 message.
4. Playwright (`--workers=2`, against the dev seed with Ward stubbed the way the existing specs stub the API): the field is there, a wrong password shows the message and stays on the page, and the request carries `current_password`. Shots of the section at 1280 light and 390 dark; read them for clipping.
5. Corpus: `wiki/accounts-and-profiles.md` (how linking works), `wiki/status.md`, `log.md`, the todo above.

## Acceptance

- [ ] The tests above pass and the new backend ones fail on today's code.
- [ ] `npm run check` at the root exits 0; `bash corpus/lint.sh` exits 0.
- [ ] End move `ready_for_deploy`, owner step: deploy with vps-deploy's `piataro` stack, phase `all` (server and frontend changed).

## Outcome (2026-11-19)

Built. `POST /auth/ward/link-ticket` takes `{ current_password }`: 422 when missing or empty, 403 `current password is incorrect` when wrong, no ticket either way. `WardSection` has the "Parola actuală" field (a form, so Enter submits), the 403 message, focus back on the field, and a generic message for other failures.

- Backend: `ward/routes.test.ts` has one new test (422 twice, 403, no stored ticket, then the right password); it fails on the old code (200 where 422 is expected, seen by stashing `routes.ts`). The existing link tests send the password and the user rows now carry a real hash.
- Playwright `ward-link.spec.ts` (Ward status stubbed on, the ticket call stubbed): wrong password shows the message, keeps focus, stays on `/cont/setari`, the request body is `{ current_password }`; another failure shows the generic message; two shots (1280 light, 390 dark) read without clipping.
- `password.spec.ts` ran in the same pass: its wrong-password case failed because the scratch API's CORS list named `localhost` while the specs used `127.0.0.1`; not touched by this brief.
- No attempt limit, as decided; todo `password-checks-have-no-attempt-limit` filed.
- Owner step: deploy with vps-deploy's `piataro` stack, phase `all`.
