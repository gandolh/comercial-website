import { test, expect, SCREENS, openScreen } from "./fixtures";

test.use({ viewport: { width: 390, height: 844 } });

for (const screen of SCREENS) {
  for (const theme of ["light", "dark"] as const) {
    test(`${screen.name} (${theme}): no horizontal overflow at 390 px`, async ({ page }) => {
      await openScreen(page, screen, theme);
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    });
  }
}
