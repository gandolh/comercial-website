import { test, expect, SCREENS, openScreen } from "./fixtures";

const STOPS = 45;

for (const screen of SCREENS) {
  test(`${screen.name}: every Tab stop shows a focus ring`, async ({ page }) => {
    await openScreen(page, screen);
    const missing: string[] = [];
    for (let i = 0; i < STOPS; i++) {
      await page.keyboard.press("Tab");
      const result = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const ringOf = (node: Element) => {
          const s = getComputedStyle(node);
          const outline = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
          const shadow = s.boxShadow !== "none";
          return outline || shadow;
        };
        // A field inside a ring-on-focus-within wrapper (the home search) shows the wrapper's ring.
        let ring = ringOf(el);
        for (
          let n: Element | null = el.parentElement, depth = 0;
          !ring && n && depth < 3;
          n = n.parentElement, depth++
        ) {
          if (n.matches(":focus-within") && ringOf(n)) ring = true;
        }
        const label = `${el.tagName.toLowerCase()}${el.getAttribute("aria-label") ? `[${el.getAttribute("aria-label")}]` : ""} ${(el.textContent ?? "").trim().slice(0, 30)}`;
        return { ring, label };
      });
      if (result && !result.ring) missing.push(result.label);
    }
    expect(missing, "stops without a ring").toEqual([]);
  });
}
