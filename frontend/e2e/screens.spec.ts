import { test, expect, SCREENS, openScreen, type Theme } from "./fixtures";

// The Roman identity's rules on every screen (brief 25): at most one filled red button in the first screen, and Cinzel
// only on fixed titles: never on a listing, a name, a message, a review or a form field.

/** The filled action's reds: action-fill and its hover, in light and dark. */
const RED_FILLS = ["rgb(154, 38, 23)", "rgb(124, 28, 15)", "rgb(194, 74, 54)", "rgb(169, 61, 43)"];

for (const screen of SCREENS) {
  for (const [width, height] of [
    [1280, 800],
    [390, 844],
  ] as const) {
    for (const theme of ["light", "dark"] as Theme[]) {
      test(`${screen.name} ${width} ${theme}: one red fill at most, Cinzel on titles only`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await openScreen(page, screen, theme);
        const result = await page.evaluate(
          ({ reds, viewport }) => {
            const inFirstScreen = (e: Element) => {
              const r = e.getBoundingClientRect();
              return e.getClientRects().length > 0 && r.bottom > 0 && r.top < viewport && r.height >= 10;
            };
            const filled = [...document.querySelectorAll("button, a, [role=button], label")]
              .filter((e) => inFirstScreen(e) && reds.includes(getComputedStyle(e).backgroundColor))
              .map((e) => (e.textContent ?? "").replace(/\s+/g, " ").trim());
            const cinzel = [...document.querySelectorAll("body *")].filter(
              (e) => e.getClientRects().length > 0 && getComputedStyle(e).fontFamily.includes("Cinzel"),
            );
            const userContent =
              'a[href*="/anunturi/"], [aria-label="Preț"], [aria-label="Autor"], [aria-labelledby="reviews-heading"] li, main [role="log"], main li[data-message]';
            const misplaced = cinzel
              .filter((e) => {
                const isWordmark = !!e.closest('a[aria-label$=", acasă"]');
                const isTitle = /^H[1-6]$/.test(e.tagName) || !!e.closest("h1, h2, h3, h4, h5, h6");
                const isField = !!e.closest("input, textarea, select, button, label, [role=combobox], [role=option]");
                return !isWordmark && (!isTitle || isField || !!e.closest(userContent));
              })
              .map((e) => `${e.tagName.toLowerCase()} "${(e.textContent ?? "").trim().slice(0, 40)}"`);
            return { filled, misplaced };
          },
          { reds: RED_FILLS, viewport: height },
        );
        expect(result.filled.length, `filled red: ${result.filled.join(", ")}`).toBeLessThanOrEqual(1);
        expect(result.misplaced, "Cinzel outside a fixed title").toEqual([]);
      });
    }
  }
}
