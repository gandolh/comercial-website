# The change-password form is not on the Settings page

Found by brief 12 (2026-11-12). `frontend/src/app/modules/settings/components/PasswordSection.tsx` is a complete
change-password form, but nothing renders it: `SettingsPage.tsx` mounts the profile, avatar and Ward sections only,
and `frontend/knip.config.js` lists the file in `ignore` as unused. So its success toast (brief 12 replaced an
`alert()` there) can't be reached, and there is no way to change a local password in the UI.

## What to decide, then do

- Whether a local password still makes sense in a demo that only the owner signs into, and that signs in through
  Ward (`WardSection`). If not, delete `PasswordSection.tsx` and its knip entry, and check the backend route it
  calls for other callers.
- If yes, mount it in `SettingsPage.tsx` (signed in with a local account only), take it out of knip's `ignore`,
  and walk it once: wrong current password, a weak new one, success (the toast).
