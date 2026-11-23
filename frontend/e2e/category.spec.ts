import { test, expect, openScreen, type Theme } from "./fixtures";

// Category and search in the Roman identity (brief 24): Cinzel titles that never truncate, red only for the
// selected state and the phone's one Filtre fill, the readout's spaced en dash.

const longest = { name: "category-longest", path: "/categorii/documente" };
const search = { name: "search", path: "/anunturi?q=Pachet" };
const allListings = { name: "all", path: "/anunturi" };
const RED_FILLS = ["rgb(154, 38, 23)", "rgb(194, 74, 54)"];

for (const width of [390, 360]) {
  for (const theme of ["light", "dark"] as Theme[]) {
    test(`the longest category name shows whole at ${width}, ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await openScreen(page, longest, theme);
      const title = page.locator("h1");
      await expect(title).toHaveText("Documente & Template-uri Legale");
      const box = await title.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          family: s.fontFamily,
          clipped: el.scrollWidth > el.clientWidth || s.textOverflow === "ellipsis" || s.webkitLineClamp !== "none",
          right: el.getBoundingClientRect().right,
        };
      });
      expect(box.family).toContain("Cinzel");
      expect(box.clipped).toBe(false);
      expect(box.right).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(
        0,
      );
      // The phone's one filled red control is Filtre.
      const filled = await page
        .locator("main button, section button, section a")
        .evaluateAll(
          (els, reds) =>
            els
              .filter((e) => e.getClientRects().length > 0 && reds.includes(getComputedStyle(e).backgroundColor))
              .map((e) => (e.textContent ?? "").replace(/\s+/g, " ").trim()),
          RED_FILLS,
        );
      expect(filled).toEqual([expect.stringContaining("Filtre")]);
    });
  }
}

for (const theme of ["light", "dark"] as Theme[]) {
  test(`on desktop nothing in the band is filled red, ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openScreen(page, { name: "set", path: "/categorii/grafica?format=zip&verificat=1" }, theme);
    const band = page.getByRole("region", { name: "Rezultate" });
    const filled = await band.locator("*").evaluateAll(
      // The slider's 4px track is red as a control in use, not a fill.
      (els, reds) =>
        els.filter((e) => e.getBoundingClientRect().height >= 10 && reds.includes(getComputedStyle(e).backgroundColor))
          .length,
      RED_FILLS,
    );
    expect(filled).toBe(0);
    // The selected state is an outline and a tint, and the switch that is on is porphyry.
    const chosen = band.getByRole("radio", { name: "ZIP" });
    await expect(chosen).toBeChecked();
    const look = await chosen.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, shadow: s.boxShadow };
    });
    expect(look.shadow).not.toBe("none");
    expect(RED_FILLS).not.toContain(look.bg);
  });
}

test("the price readout is spaced with an en dash, in lining figures", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openScreen(page, longest);
  const output = page.getByRole("region", { name: "Rezultate" }).locator("output");
  await expect(output).toHaveText("0 RON – 100.000+ RON");
  expect(await output.evaluate((el) => getComputedStyle(el).fontVariantNumeric)).toContain("lining-nums");
});

test("the search results' title is user text when it repeats the query, and Cinzel when it doesn't", async ({
  page,
}) => {
  await openScreen(page, search);
  expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily)).not.toContain("Cinzel");
  await openScreen(page, allListings);
  expect(await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily)).toContain("Cinzel");
  // The count reads as Romanian: no "de" under 20.
  await expect(page.getByText(/^\d+ anunțuri găsite$|^1 anunț găsit$|^\d+ de anunțuri găsite$/)).toBeVisible();
});
