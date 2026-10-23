import { configDefaults, defineConfig } from "vitest/config";

// Vitest 4 no longer excludes dist/ by default, and `npm run build` compiles
// every *.test.ts into core/dist and app/dist. Keep running the sources only.
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "**/dist/**"],
  },
});
