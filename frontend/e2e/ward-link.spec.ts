import { mkdirSync } from "node:fs";
import path from "node:path";
import { test, expect, SCREENS, openScreen, type Theme } from "./fixtures";

const settings = SCREENS.find((screen) => screen.name === "settings") ?? SCREENS[0];
const shotsDir = process.env.SHOTS_DIR;

/** The "Autentificare cu Ward" section on the account settings. Ward is stubbed on: the dev API runs without it. */
test.describe("linking Ward asks for the password", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/auth/ward/status", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ enabled: true }) }),
    );
  });

  test("a wrong password shows the message, keeps focus and stays on the page", async ({ page }) => {
    let body: unknown;
    await page.route("**/auth/ward/link-ticket", (route) => {
      body = route.request().postDataJSON();
      return route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ error: "current password is incorrect" }),
      });
    });
    await openScreen(page, settings);
    const section = page.getByRole("form", { name: "Leagă contul Ward" });
    const field = section.getByLabel("Parola actuală");
    await expect(field).toBeVisible();
    await field.fill("not-the-password");
    await section.getByRole("button", { name: "Leagă contul Ward" }).click();
    await expect(section.getByRole("alert")).toHaveText("Parola actuală nu este corectă.");
    expect(body).toEqual({ current_password: "not-the-password" });
    await expect(field).toBeFocused();
    expect(new URL(page.url()).pathname).toBe("/cont/setari");
  });

  test("any other failure shows the generic message", async ({ page }) => {
    await page.route("**/auth/ward/link-ticket", (route) => route.fulfill({ status: 500, body: "{}" }));
    await openScreen(page, settings);
    const section = page.getByRole("form", { name: "Leagă contul Ward" });
    await section.getByLabel("Parola actuală").fill("whatever");
    await section.getByRole("button", { name: "Leagă contul Ward" }).click();
    await expect(section.getByRole("alert")).toHaveText("Nu am putut începe legarea. Încearcă din nou.");
  });

  for (const [width, theme] of [
    [1280, "light"],
    [390, "dark"],
  ] as [number, Theme][]) {
    test(`shot of the section ${theme} ${width}`, async ({ page }) => {
      test.skip(!shotsDir, "set SHOTS_DIR to take screenshots");
      if (!shotsDir) return;
      mkdirSync(shotsDir, { recursive: true });
      await page.route("**/auth/ward/link-ticket", (route) =>
        route.fulfill({
          status: 403,
          contentType: "application/json",
          body: '{"error":"current password is incorrect"}',
        }),
      );
      await page.setViewportSize({ width, height: width < 500 ? 844 : 800 });
      await openScreen(page, settings, theme);
      const section = page.getByRole("form", { name: "Leagă contul Ward" });
      await section.getByLabel("Parola actuală").fill("wrong");
      await section.getByRole("button", { name: "Leagă contul Ward" }).click();
      await expect(section.getByRole("alert")).toBeVisible();
      const card = page.locator("section", { has: section });
      await card.screenshot({ path: path.join(shotsDir, `ward-link-${theme}-${width}.png`) });
    });
  }
});
