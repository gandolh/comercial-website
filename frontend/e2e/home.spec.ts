import { test, expect, openScreen, type Theme } from "./fixtures";

// Home as an inscription (brief 23): the first screens stay brief 14's, the ornament gives way, and Caută is the
// page's one filled red button.

const home = { name: "home", path: "/" };

/** The filled action's two reds: action-fill in light and in dark. */
const RED_FILLS = ["rgb(154, 38, 23)", "rgb(194, 74, 54)"];

for (const theme of ["light", "dark"] as Theme[]) {
  test(`first screen at 1280 × 800, ${theme}: the hero ends by y 340 and every tile is whole`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openScreen(page, home, theme);
    const hero = await page.locator("main > section").first().boundingBox();
    expect(hero && hero.y + hero.height).toBeLessThanOrEqual(340);
    const tiles = page.locator('section[aria-labelledby="popular-categories"] ul > li');
    await expect(tiles).toHaveCount(14);
    const bottoms = await tiles.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().bottom));
    for (const bottom of bottoms) expect(bottom).toBeLessThanOrEqual(800);
  });

  test(`first screen at 390 × 844, ${theme}: six tiles are whole above the bottom bar`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openScreen(page, home, theme);
    const barTop = await page
      .getByRole("navigation", { name: "Navigare" })
      .evaluate((e) => e.getBoundingClientRect().top);
    const whole = await page
      .locator('section[aria-labelledby="popular-categories"] ul > li')
      .evaluateAll((els, limit) => els.filter((e) => e.getBoundingClientRect().bottom <= limit).length, barTop);
    expect(whole).toBeGreaterThanOrEqual(6);
    // The title is one line on a phone.
    const lines = await page
      .locator("h1")
      .evaluate((e) => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)));
    expect(lines).toBe(1);
  });

  test(`one filled red button on the page, ${theme}`, async ({ page }) => {
    await openScreen(page, home, theme);
    const filled = await page
      .locator("button, a")
      .evaluateAll(
        (els, reds) =>
          els
            .filter((e) => e.getClientRects().length > 0 && reds.includes(getComputedStyle(e).backgroundColor))
            .map((e) => (e.textContent ?? "").trim()),
        RED_FILLS,
      );
    expect(filled).toEqual(["Caută"]);
  });
}

for (const width of [390, 360]) {
  test(`no horizontal overflow at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await openScreen(page, home);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
}

test("the ornament is hidden and unfocusable, and the search keeps its label", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openScreen(page, home);
  const drawings = await page
    .locator("main svg")
    .evaluateAll((els) => els.filter((e) => !e.closest('[aria-hidden="true"]')).length);
  expect(drawings).toBe(0);
  await expect(
    page.locator('main [aria-hidden="true"] :is(a, button, input, select, textarea, [tabindex])'),
  ).toHaveCount(0);
  // The field keeps brief 14's label and its placeholder.
  const field = page.getByPlaceholder("Ce cauți astăzi?");
  await expect(field).toBeVisible();
  await expect(field).toHaveAccessibleName("Caută anunțuri");
});
