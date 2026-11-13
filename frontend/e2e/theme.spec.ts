import { test, expect, SCREENS, openScreen } from "./fixtures";

const home = SCREENS[0];

const BACKGROUND = { light: "rgb(242, 242, 238)", dark: "rgb(19, 20, 22)" };

test("the theme switch sets light, dark and system", async ({ page }) => {
  await openScreen(page, home, "light");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(page.locator("body")).toHaveCSS("background-color", BACKGROUND.light);

  await page.getByRole("radio", { name: "Întunecat" }).click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", BACKGROUND.dark);

  await page.getByRole("radio", { name: "Sistem" }).click();
  await expect(page.getByRole("radio", { name: "Sistem" })).toBeChecked();
});

for (const scheme of ["light", "dark"] as const) {
  test(`System follows a ${scheme} system`, async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: scheme });
    const page = await context.newPage();
    await openScreen(page, home, "system");
    await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
    await expect(page.locator("body")).toHaveCSS("background-color", BACKGROUND[scheme]);
    await context.close();
  });
}
