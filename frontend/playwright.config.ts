import { defineConfig, devices } from "@playwright/test";

// The specs run against a dev server that is already up: start the API on a scratch database seeded with
// `seed:dev` and `seed:samples`, then `VITE_API_URL=<api> npm run dev`, and set PIATARO_E2E_URL to the dev server.
// The dev account's password comes from PIATARO_E2E_PASSWORD (never written in a spec). Headless Chromium only.
export default defineConfig({
  testDir: "./e2e",
  workers: 2,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: process.env.PIATARO_E2E_URL ?? "http://127.0.0.1:5173",
    ...devices["Desktop Chrome"],
  },
});
