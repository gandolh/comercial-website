import { houseStyle } from "../vendor/house-style/eslint.config.js";

// The house config from the vendored house-style copy, given this project's folders. The compiler is
// the first gate; the house adds only what it cannot see.
export default [
  ...houseStyle({
    root: import.meta.dirname,
    web: "src",
    // The Tailwind rules read the theme in the one stylesheet: unknown and deprecated classes, and the class order, are errors.
    tailwind: { css: "src/index.css", order: true },
    // i18n.ts initialises i18next as a side effect of being imported and keeps a default export.
    defaultExports: ["src/core/lib/i18n.ts"],
  }),
  {
    // The icon font's own class: a rule in index.css outside every layer (the .material-symbols-outlined note there).
    name: "piataro-web/icon-font-class",
    files: ["src/**"],
    rules: { "better-tailwindcss/no-unknown-classes": ["error", { ignore: ["material-symbols-outlined"] }] },
  },
];
