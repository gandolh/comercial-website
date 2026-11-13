import { test, expect, SCREENS, openScreen } from "./fixtures";

const settings = SCREENS.find((screen) => screen.name === "settings") ?? SCREENS[0];

/** The account settings' "Securitate" form. The success case stubs the API: a real change would leave the dev account on a new password for the other specs. */
test.describe("the change-password form on the account settings", () => {
  test.beforeEach(async ({ page }) => {
    await openScreen(page, settings);
  });

  const fill = async (page: import("@playwright/test").Page, current: string, next: string, confirm: string) => {
    await page.getByLabel("Parola actuală").fill(current);
    await page.getByLabel("Parola nouă", { exact: true }).fill(next);
    await page.getByLabel("Confirmă parola nouă").fill(confirm);
    await page.getByRole("button", { name: "Schimbă parola" }).click();
  };

  test("a wrong current password shows the API's refusal in Romanian", async ({ page }) => {
    await fill(page, "not-the-password", "a-long-new-password", "a-long-new-password");
    await expect(page.getByRole("alert")).toHaveText("Parola actuală nu este corectă.");
  });

  test("a short new password is refused before any request", async ({ page }) => {
    let requested = false;
    await page.route("**/users/me/password", (route) => {
      requested = true;
      return route.abort();
    });
    await fill(page, "whatever", "too-short", "too-short");
    await expect(page.getByRole("alert")).toHaveText("Parola nouă trebuie să aibă cel puțin 12 caractere.");
    expect(requested).toBe(false);
  });

  test("a confirmation that differs is refused", async ({ page }) => {
    await fill(page, "whatever", "a-long-new-password", "a-long-new-passwore");
    await expect(page.getByRole("alert")).toHaveText("Parolele noi nu coincid.");
  });

  test("a success shows the toast and clears the form", async ({ page }) => {
    await page.route("**/users/me/password", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );
    await fill(page, "whatever", "a-long-new-password", "a-long-new-password");
    await expect(page.getByText("Parola a fost schimbată cu succes!")).toBeVisible();
    await expect(page.getByLabel("Parola actuală")).toHaveValue("");
    await expect(page.getByLabel("Parola nouă", { exact: true })).toHaveValue("");
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
});
