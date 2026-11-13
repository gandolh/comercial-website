import { mkdirSync } from "node:fs";
import path from "node:path";
import { test, SCREENS, openScreen } from "./fixtures";

// Writes <screen>-<theme>-<width>.png into SHOTS_DIR (kept out of git): SHOTS_DIR=<dir> npx playwright test shots
const dir = process.env.SHOTS_DIR;

for (const width of [1280, 390]) {
  for (const theme of ["light", "dark"] as const) {
    for (const screen of SCREENS) {
      test(`shot ${screen.name} ${theme} ${width}`, async ({ page }) => {
        test.skip(!dir, "set SHOTS_DIR to take screenshots");
        if (!dir) return;
        mkdirSync(dir, { recursive: true });
        await page.setViewportSize({ width, height: width < 500 ? 844 : 800 });
        await openScreen(page, screen, theme);
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(dir, `${screen.name}-${theme}-${width}.png`) });
      });
    }
  }
}
