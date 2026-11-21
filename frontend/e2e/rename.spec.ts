import { test, expect, openScreen } from "./fixtures";

// The product's visible name is Mercatus (brief 26); the paths, packages and stack names stay.

test("the tab title, the wordmark and the footer say Mercatus", async ({ page }) => {
  await openScreen(page, { name: "home", path: "/" });
  await expect(page).toHaveTitle(/^Mercatus/);
  const mark = page.getByRole("link", { name: "Mercatus, acasă" }).first();
  await expect(mark).toBeVisible();
  await expect(mark).toHaveText("MERCATVS");
  await expect(page.locator("footer small")).toContainText("Mercatus. Toate drepturile rezervate.");
  await expect(page.locator("body")).not.toContainText("PiațăRo");
});

test("the sign-in card and the legal pages say Mercatus", async ({ page }) => {
  await openScreen(page, { name: "signin", path: "/autentificare" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mercatus");
  await expect(page.getByText("Mercatus este o demonstrație: doar proprietarul are cont.")).toBeVisible();
  for (const path of ["/termeni", "/confidentialitate", "/despre", "/contact"]) {
    await openScreen(page, { name: path, path });
    await expect(page.locator("main")).toContainText("Mercatus");
    await expect(page.locator("body")).not.toContainText("PiațăRo");
  }
});
