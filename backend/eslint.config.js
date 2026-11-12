import { houseStyle } from "../vendor/house-style/eslint.config.js";

// The house config from the vendored house-style copy, given this project's folders. The compiler is
// the first gate; the house adds only what it cannot see.
export default [
  ...houseStyle({
    root: import.meta.dirname,
    server: ["app/src", "core/src"],
    // The seed and owner commands and the migrator talk to the person running them, and the log email
    // service prints by design. The server entry logs through Fastify's logger.
    console: [
      "app/src/seed-dev.ts",
      "app/src/seed-samples.ts",
      "app/src/create-owner.ts",
      "app/src/migrate.ts",
      "core/src/lib/email.ts",
    ],
    // The env reader: the one place that says what the app needs.
    env: ["app/src/config.ts"],
    ignores: ["app/vendor/**", "app/data/**", "data/**"],
  }),
  {
    // A warning for now (2026-11-11): the rows and request bodies of these modules are typed `any`, from
    // before the Kysely row types were used (the count is in the corpus log). When the modules take their
    // types from the repositories, this block goes and the rule is an error again.
    name: "piataro-backend/any-warns",
    files: ["app/src/**"],
    rules: { "@typescript-eslint/no-explicit-any": "warn" },
  },
  {
    // A warning for now (2026-11-11): these helpers run outside a request and the app context carries no
    // logger. When it does, they log through it and this block goes.
    name: "piataro-backend/console-warns",
    files: ["app/src/jobs/expiry-reminders.ts", "app/src/modules/assets.ts", "app/src/modules/messaging.ts"],
    rules: { "no-console": "warn" },
  },
];
