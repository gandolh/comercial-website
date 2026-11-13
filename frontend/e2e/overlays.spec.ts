import path from "node:path";
import { test, expect, IDS, openScreen } from "./fixtures";

// The cookie banner, a toast and a modal, shot once per width into SHOTS_DIR (kept out of git).
const dir = process.env.SHOTS_DIR;

for (const width of [1280, 390]) {
  test.describe(`overlays at ${width}`, () => {
    test.beforeEach(({ page }) => {
      test.skip(!dir, "set SHOTS_DIR to take screenshots");
      return page.setViewportSize({ width, height: width < 500 ? 844 : 800 });
    });

    test("the cookie banner", async ({ page }) => {
      if (!dir) return;
      await page.goto("/");
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(dir, `cookie-banner-light-${width}.png`) });
    });

    test("a toast", async ({ page }) => {
      if (!dir) return;
      await openScreen(page, { name: "detail", path: `/anunturi/${IDS.listing}` });
      await page.getByRole("button", { name: "Adaugă la favorite" }).first().click();
      await expect(page.getByText("Conectează-te pentru a salva anunțuri.")).toBeVisible();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(dir, `toast-light-${width}.png`) });
    });

    test("a modal", async ({ page }) => {
      if (!dir) return;
      await openScreen(page, { name: "detail", path: `/anunturi/${IDS.listing}`, signedIn: true });
      await page.getByRole("button", { name: "Contactează Autorul", exact: true }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(dir, `modal-light-${width}.png`) });
    });
  });
}
