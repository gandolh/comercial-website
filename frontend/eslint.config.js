import { houseStyle } from "../vendor/house-style/eslint.config.js";

// The house config from the vendored house-style copy, given this project's folders. The compiler is
// the first gate; the house adds only what it cannot see.
export default [
  ...houseStyle({
    root: import.meta.dirname,
    web: "src",
    // i18n.ts initialises i18next as a side effect of being imported and keeps a default export.
    defaultExports: ["src/core/lib/i18n.ts"],
  }),
  {
    // A warning for now (2026-11-11): handlers that return a promise sit on `onClick`, `onSubmit` and
    // `onRetry` attributes, 49 of them. Each wants a `() => void handler()` wrapper (a form's
    // `handleSubmit(onSubmit)` too). When the pages are wrapped, this block goes and the rule is an error
    // again.
    name: "piataro-web/misused-promises-warns",
    files: ["src/**"],
    rules: { "@typescript-eslint/no-misused-promises": "warn" },
  },
];
