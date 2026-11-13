import path from "node:path";
import { test, expect, openScreen, type Screen } from "./fixtures";

const category: Screen = { name: "category", path: "/categorii/grafica" };
const dir = process.env.SHOTS_DIR;

test("the band applies each pick at once and shows removable chips", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openScreen(page, category);
  await page.getByRole("radiogroup", { name: "Format Fișier" }).getByRole("radio", { name: "ZIP" }).click();
  await expect(page).toHaveURL(/format=zip/);
  const chips = page.getByRole("list", { name: "Filtre active" }).first();
  await expect(chips.getByText("ZIP")).toBeVisible();
  await chips.getByRole("button", { name: "Elimină ZIP" }).click();
  await expect(page).not.toHaveURL(/format=/);
});

test("the phone sheet applies its picks together from Aplică filtrele", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openScreen(page, category);
  await page.getByRole("button", { name: "Filtre", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: "Filtre" });
  await sheet.getByRole("radiogroup", { name: "Tip Licență" }).getByRole("radio", { name: "Comercială" }).click();
  await sheet.getByRole("radiogroup", { name: "Format Fișier" }).getByRole("radio", { name: "ZIP" }).click();
  // Nothing is applied until the footer button is pressed.
  await expect(page).not.toHaveURL(/licenta=/);
  if (dir) await page.screenshot({ path: path.join(dir, "category-sheet-light-390.png") });
  await sheet.getByRole("button", { name: "Aplică filtrele" }).click();
  await expect(page).toHaveURL(/licenta=commercial/);
  await expect(page).toHaveURL(/format=zip/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
