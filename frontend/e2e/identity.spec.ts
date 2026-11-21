import type { CDPSession } from "@playwright/test";
import { test, expect, SCREENS, IDS, openScreen } from "./fixtures";

// The Roman identity's faces and figures (brief 21). Chromium reports which fonts drew a node's text
// (CSS.getPlatformFontsForNode), so "no fallback glyphs" is a list of exactly one family.

const screen = (name: string) => {
  const found = SCREENS.find((s) => s.name === name);
  if (!found) throw new Error(`no screen ${name}`);
  return found;
};

async function fontsFor(cdp: CDPSession, selector: string): Promise<string[]> {
  const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector });
  expect(nodeId, selector).toBeGreaterThan(0);
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  return fonts.map((f) => f.familyName);
}

test("ă â î ș ț render in Alegreya Sans and in Cinzel, with no fallback glyphs", async ({ page }) => {
  const fontFiles: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "font") fontFiles.push(request.url());
  });
  await openScreen(page, screen("home"));
  // A probe in each face, holding all five letters in both cases (Cinzel draws lower case as small capitals).
  await page.evaluate(() => {
    for (const [id, family] of [
      ["probe-body", "var(--font-body)"],
      ["probe-cap", "var(--font-cap)"],
    ]) {
      const el = document.createElement("p");
      el.id = id;
      el.style.fontFamily = family;
      el.style.fontWeight = id === "probe-cap" ? "600" : "400";
      el.textContent = "ă â î ș ț Ă Â Î Ș Ț";
      document.body.append(el);
    }
  });
  await page.evaluate(() => document.fonts.ready);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  // One face per node (Chromium names the face itself, such as "Cinzel SemiBold").
  const only = async (selector: string, family: RegExp) => {
    const fonts = await fontsFor(cdp, selector);
    expect(fonts, selector).toHaveLength(1);
    expect(fonts[0], selector).toMatch(family);
  };
  await only("#probe-body", /^Alegreya Sans/);
  await only("#probe-cap", /^Cinzel/);
  // The page's own text: the hero title, with ă â î.
  await only("h1", /^Alegreya Sans/);

  // Self-hosted, each file once (the icon font keeps its Google Fonts link).
  const own = fontFiles.filter((url) => !url.includes("fonts.gstatic.com"));
  expect(own.length).toBeGreaterThan(0);
  for (const url of own) expect(new URL(url).origin).toBe(new URL(page.url()).origin);
  expect(new Set(own).size).toBe(own.length);
});

test("prices, counts and IDs use lining figures; titles are not in Cinzel", async ({ page }) => {
  await openScreen(page, screen("category"));
  const price = page.locator("span.tabular-nums").first();
  await expect(price).toBeVisible();
  expect(await price.evaluate((el) => getComputedStyle(el).fontVariantNumeric)).toBe("lining-nums tabular-nums");
  const count = page.getByText(/^\d+ (de )?anunț/).first();
  await expect(count).toBeVisible();
  expect(await count.evaluate((el) => getComputedStyle(el).fontVariantNumeric)).toContain("lining-nums");

  await openScreen(page, { name: "detail", path: `/anunturi/${IDS.listing}` });
  const id = page.getByText(/ID: /).first();
  await expect(id).toBeVisible();
  expect(await id.evaluate((el) => getComputedStyle(el).fontVariantNumeric)).toBe("lining-nums tabular-nums");
  // --font-headline is Alegreya Sans, so a listing title (user content) never takes Cinzel.
  const title = page.locator("h1").first();
  expect(await title.evaluate((el) => getComputedStyle(el).fontFamily)).not.toContain("Cinzel");
  expect(
    await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--font-headline")),
  ).not.toContain("Cinzel");
});
