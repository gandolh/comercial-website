# Task 16: Wire the change-password form, delete the other eleven never-wired files

**Depends on:** brief 12 (found it) and the todo [the-change-password-form-is-not-wired](../../todos/the-change-password-form-is-not-wired.md). The owner's answer (2026-11-13, answer 4): wire the form, because the local password is the owner's only local sign-in and `docs/deploy.md` promises that a password changed in **Setări** stays changed; delete the other eleven files on knip's ignore list, because sign-up is closed.

## Context

`frontend/src/app/modules/settings/components/PasswordSection.tsx` is a finished form that nothing mounts, so a local password cannot be changed in the UI. Reading it against the server shows what else is missing:

- It reads the error from `response.data.message`; the API's errors are `{ error }` (`features/users/routes.ts`: 403 `current password is incorrect`, 422 the schema's first issue in English). The user would always see the generic text.
- The route (`PATCH /users/me/password`) takes `min(8)` for both passwords, while the owner's password is created at 12 or more (`docs/deploy.md`, `OWNER_PASSWORD`). The new password follows the same floor: 12.
- It validates the confirmation on submit only and is an uncontrolled-by-form-library `onSubmit` async handler (a `no-misused-promises` warning).
- The route has one schema test and no flow test (wrong current password, success, the old password stops working).

Knip's `ignore` list in `frontend/knip.config.js` holds twelve files "never wired in": `PasswordSection.tsx` and eleven more (`FormField`, `SubmitButton`, `useResendVerificationMutation`, `StepFooter`, `useCreateDraftMutation`, `SpecsBento`, `AvatarUploader`, `locationQueries`, `routes/builders.tsx`, `core/index.ts`, `core/shared/constants/cities.ts`). Sign-up is closed (the owner is the only account), so these stay unwired.

## Files you OWN

- `frontend/src/app/modules/settings/` (the section, `SettingsPage.tsx`, hook and service if they need changes)
- `backend/app/src/features/users/` (`routes.ts`, `routes.test.ts`)
- `frontend/e2e/` (one new spec for the account settings password flow; `fixtures.ts` only if it needs a helper)
- `frontend/knip.config.js` (the ignore list)
- the eleven files named above, to delete them, and whatever only they import
- `corpus/` bookkeeping for this brief, `docs/` lines that name the form

## Files you must NOT touch

Migrations, other features' routes, `backend/core`, `backend/app/vendor/`, `vendor/`, lockfiles, deploy files, `backend/knip.config.js`.

## What to do

1. Mount `PasswordSection` in `SettingsPage.tsx` (the left column, after `WardSection`). Every account has a local password (Ward only links to the owner's account), so no condition.
2. Fix the form: read `error` from the reply (map 403 to a Romanian "Parola actuală nu este corectă" and a 422 to a Romanian "Parola nouă trebuie să aibă cel puțin 12 caractere"); check length and confirmation before the request, with the message next to the form; wrap the submit handler so the `no-misused-promises` warning does not appear in this file. Keep the success toast.
3. Server: the new password needs at least 12 characters (`changePasswordSchema`); the current password only needs to be non-empty. Update the schema test's expectation (the message names the new bound).
4. Tests: a backend flow test (wrong current password answers 403 and leaves the hash; a right one answers 200, the old password then fails `POST /auth/login` and the new one passes; a new password under 12 characters answers 422). One Playwright spec on the account settings screen: wrong current password shows the error, a short new password shows the error, a success shows the toast, and the form clears.
5. Delete the other eleven files and anything that becomes unused through them. Remove each from the ignore list, and the list's comment with it when it is empty. Run knip: a file that turns out to be used (an importer you did not expect) stays, comes off the "delete" list with a line saying why, and keeps its ignore entry only if knip still flags it.
6. `docs/deploy.md` already promises the change; fix any other doc line that says the form is missing. Fold the result into `wiki/accounts-and-profiles.md` and `wiki/status.md`; mark the todo promoted.

## Acceptance

- `npm run check` at the root exits 0; `bash corpus/lint.sh` exits 0.
- The new backend test fails on the old code and passes now; Playwright (`--workers=2`) on the account settings screens passes against a scratch dev seed.
- Knip's ignore list is empty of the twelve files.
- The outcome note lists every deleted file, and any kept with the reason.
- Owner step: deploy with vps-deploy's `piataro` stack (frontend and server both changed, so phase `all`; briefs 10 to 15 also wait for the owner's deploy).
