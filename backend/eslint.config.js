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
];
