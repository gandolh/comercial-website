import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Served at /piataro/ in the deploy (PIATARO_BASE=/piataro/), at / in dev.
const base = process.env.PIATARO_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  // The frontend's tests run in node: the cn() merge and the stylesheet, read as text. Flows are checked in Playwright.
  test: { environment: "node" },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@core": path.resolve(import.meta.dirname, "./src/core"),
      "@app": path.resolve(import.meta.dirname, "./src/app"),
    },
  },
});
