import { expect, test } from "@playwright/test";

test("the terms cite OUG 34/2014 and no closed ODR platform", async ({ page }) => {
  await page.goto("/termeni");
  const body = page.locator("main");
  await expect(body).toContainText("OUG nr. 34/2014");
  await expect(body).not.toContainText("141/2021");
  await expect(page.locator('a[href*="ec.europa.eu/consumers/odr"]')).toHaveCount(0);
  await expect(page.locator('a[href^="https://reclamatiisal.anpc.ro"]')).toHaveCount(1);
});
