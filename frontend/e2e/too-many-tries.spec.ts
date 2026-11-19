import type { Route } from "@playwright/test";
import { test, expect, SCREENS, openScreen } from "./fixtures";

const settings = SCREENS.find((screen) => screen.name === "settings") ?? SCREENS[0];
const signin = SCREENS.find((screen) => screen.name === "signin") ?? SCREENS[0];

/** A 429 from the API, with the headers a cross-origin page needs to read Retry-After. */
const tooMany = (retryAfter?: string) => (route: Route) =>
  route.fulfill({
    status: 429,
    contentType: "application/json",
    headers: {
      "access-control-allow-origin": route.request().headers().origin ?? "*",
      "access-control-expose-headers": "Retry-After",
      ...(retryAfter ? { "retry-after": retryAfter } : {}),
    },
    body: JSON.stringify({ error: "rate limit exceeded" }),
  });

/** Wrong password tries are limited (brief 20): the three password checks show the wait in minutes. API stubbed to 429. */
test.describe("too many wrong password tries", () => {
  test("the sign-in page says to wait 5 minutes", async ({ page }) => {
    await page.route("**/auth/login", tooMany("300"));
    await openScreen(page, signin);
    await page.getByLabel("Email").fill("demo@example.com");
    await page.getByLabel("Parolă").fill("whatever");
    await page.getByRole("button", { name: "Autentifică-te" }).click();
    await expect(page.getByText("Prea multe încercări. Încearcă din nou peste 5 minute.")).toBeVisible();
  });

  test("the change-password form says it too, rounding up", async ({ page }) => {
    await page.route("**/users/me/password", tooMany("301"));
    await openScreen(page, settings);
    await page.getByLabel("Parola actuală").fill("whatever");
    await page.getByLabel("Parola nouă", { exact: true }).fill("a-long-new-password");
    await page.getByLabel("Confirmă parola nouă").fill("a-long-new-password");
    await page.getByRole("button", { name: "Schimbă parola" }).click();
    await expect(page.getByRole("alert")).toHaveText("Prea multe încercări. Încearcă din nou peste 6 minute.");
  });

  test("the Ward section says 'peste un minut' under 60 seconds", async ({ page }) => {
    await page.route("**/auth/ward/status", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": route.request().headers().origin ?? "*" },
        body: JSON.stringify({ enabled: true }),
      }),
    );
    await page.route("**/auth/ward/link-ticket", tooMany("30"));
    await openScreen(page, settings);
    const section = page.getByRole("form", { name: "Leagă contul Ward" });
    await section.getByLabel("Parola actuală").fill("whatever");
    await section.getByRole("button", { name: "Leagă contul Ward" }).click();
    await expect(section.getByRole("alert")).toHaveText("Prea multe încercări. Încearcă din nou peste un minut.");
  });
});
