# House-style warnings still held

> Promoted to [brief 17](../briefs/todo/17-the-house-style-warnings.md) on 2026-11-13.

Brief 11 left these rules as dated warnings, each in the project's `eslint.config.js`. Each wants a brief
of its own, or goes with the brief that already covers it.

- **`no-misused-promises` in the frontend, 49 sites.** Async handlers on `onClick`, `onSubmit` and
  `onRetry`. Wrap each as `() => void handler()` (a form's `handleSubmit(onSubmit)` too). Then the rule is
  an error again.
- **`no-explicit-any` in the backend, 63 in source and 1 in a test.** Untyped Kysely rows and request
  bodies in the route modules (`users.ts` 25, `messaging.ts` 11, `favorites.ts` 6). Type them from the
  repositories, or from the route schemas when the server brief adds them.
- **`no-console` in the backend, 6 sites** in `expiry-reminders.ts`, `assets.ts` and `messaging.ts`: code
  that runs outside a request and has no logger. Give the app context a logger.
- **`n/no-process-env` in the backend, 11 sites** in the CLIs and a few readers; the server brief moves
  them into the config module.
- **Frontend `react-hooks/exhaustive-deps` 4 and `incompatible-library` 4**, warnings as the house sets
  them.
- **knip exceptions**: 12 unused frontend files and the `pino`, `@tanstack/router-devtools` and
  `@fastify/multipart` dependency notes, in the two `knip.config.js` files. Delete or wire each.
