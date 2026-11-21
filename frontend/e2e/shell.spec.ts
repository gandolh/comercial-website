import { test, expect, openScreen, type Theme } from "./fixtures";
import { toRoman } from "../src/core/lib/roman";

// The Roman shell (brief 22): the wordmark, the friezes, the footer's year, the bar's focus rings, and the bar at
// phone widths signed out and signed in.

const home = { name: "home", path: "/" };
const homeSignedIn = { ...home, signedIn: true };

function luminance(rgb: string): number {
  const [r = 0, g = 0, b = 0] = (rgb.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map((v) => {
    const c = Number(v) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [hi = 0, lo = 0] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test("the footer shows the year in Roman numerals and says the Arabic year to assistive technology", async ({
  page,
}) => {
  await openScreen(page, home);
  const year = new Date().getFullYear();
  const line = page.locator("footer small");
  await expect(line.locator('[aria-hidden="true"]')).toHaveText(toRoman(year));
  const tree = await line.ariaSnapshot();
  expect(tree).toContain(String(year));
  expect(tree).not.toContain(toRoman(year));
  await expect(page.getByRole("link", { name: /, acasă$/ }).first()).toBeVisible();
});

test("the ornament is hidden from assistive technology and has no tab stop", async ({ page }) => {
  await openScreen(page, home);
  // Every drawing in the shell is aria-hidden, and nothing focusable sits inside an aria-hidden ornament.
  const unhidden = await page.evaluate(
    () =>
      [...document.querySelectorAll("header svg, footer svg, [data-ornament], header + div svg")].filter(
        (svg) => !svg.closest('[aria-hidden="true"]'),
      ).length,
  );
  expect(unhidden).toBe(0);
  await expect(page.locator('[aria-hidden="true"] :is(a, button, input, select, textarea, [tabindex])')).toHaveCount(0);
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const insideOrnament = await page.evaluate(() => {
      const el = document.activeElement;
      return !!el && (el.tagName.toLowerCase() === "svg" || !!el.closest('[aria-hidden="true"]'));
    });
    expect(insideOrnament).toBe(false);
  }
});

test("every bar control on porphyry shows a ring that clears 3:1 against the bar", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openScreen(page, home);
  const bar = await page.locator("header").evaluate((el) => getComputedStyle(el).backgroundColor);
  const seen: string[] = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || !el.closest("header")) return null;
      const s = getComputedStyle(el);
      return {
        label: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim(),
        style: s.outlineStyle,
        width: parseFloat(s.outlineWidth),
        color: s.outlineColor,
      };
    });
    if (!ring) continue;
    seen.push(ring.label);
    expect(ring.style, ring.label).not.toBe("none");
    expect(ring.width, ring.label).toBeGreaterThan(0);
    expect(contrast(ring.color, bar), ring.label).toBeGreaterThanOrEqual(3);
  }
  expect(seen.length).toBeGreaterThanOrEqual(4); // the wordmark, three places, Conectare
});

for (const width of [390, 360]) {
  for (const theme of ["light", "dark"] as Theme[]) {
    for (const signedIn of [false, true]) {
      test(`no horizontal overflow at ${width}, ${theme}, ${signedIn ? "signed in" : "signed out"}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        await openScreen(page, signedIn ? homeSignedIn : home, theme);
        const { scroll, inner } = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          inner: window.innerWidth,
        }));
        expect(scroll).toBeLessThanOrEqual(inner);
        // Everything in the bar stays inside it.
        const right = await page
          .locator("header *")
          .evaluateAll((els) =>
            Math.max(...els.filter((e) => e.getClientRects().length > 0).map((e) => e.getBoundingClientRect().right)),
          );
        expect(right).toBeLessThanOrEqual(width);
        if (signedIn) await expect(page.getByRole("link", { name: "Adaugă Anunț" })).toBeVisible();
      });
    }
  }
}
