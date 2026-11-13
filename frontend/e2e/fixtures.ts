import { test as base, expect, type Page } from "@playwright/test";

/** The dev seed's ids (backend/seed/dev): the demo account owns the third listing; the second is a paid file. */
export const IDS = {
  listing: "10000000000000000000000000000002",
  ownListing: "10000000000000000000000000000003",
  seller: "00000000000000000000000000000002",
};

export interface Screen {
  name: string;
  path: string;
  /** Needs the dev account's session. */
  signedIn?: boolean;
}

/** Every screen of the app a visitor or the owner reaches by a URL. */
export const SCREENS: Screen[] = [
  { name: "home", path: "/" },
  { name: "categories", path: "/categorii" },
  { name: "category", path: "/categorii/grafica" },
  { name: "search", path: "/anunturi?q=Pachet" },
  { name: "detail", path: `/anunturi/${IDS.listing}` },
  { name: "profile", path: `/utilizator/${IDS.seller}` },
  { name: "signin", path: "/autentificare" },
  { name: "ward-return", path: "/autentificare/ward" },
  { name: "verify-email", path: "/verifica-email" },
  { name: "terms", path: "/termeni" },
  { name: "privacy", path: "/confidentialitate" },
  { name: "cookies", path: "/politica-cookies" },
  { name: "about", path: "/despre" },
  { name: "contact", path: "/contact" },
  { name: "help", path: "/ajutor" },
  { name: "favorites", path: "/favorite", signedIn: true },
  { name: "messages", path: "/mesaje", signedIn: true },
  { name: "orders", path: "/comenzi", signedIn: true },
  { name: "order-confirmation", path: "/comenzi/confirmare", signedIn: true },
  { name: "dashboard", path: "/cont", signedIn: true },
  { name: "my-listings", path: "/cont/anunturi", signedIn: true },
  { name: "settings", path: "/cont/setari", signedIn: true },
  { name: "invoices", path: "/facturi", signedIn: true },
  { name: "create", path: "/adauga-anunt", signedIn: true },
  { name: "edit", path: `/anunturi/${IDS.ownListing}/editeaza`, signedIn: true },
];

async function sessionToken(): Promise<string> {
  const api = process.env.PIATARO_E2E_API;
  const password = process.env.PIATARO_E2E_PASSWORD;
  if (!api || !password)
    throw new Error("set PIATARO_E2E_API and PIATARO_E2E_PASSWORD (the scratch API and the dev account's password)");
  const response = await fetch(`${api}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "demo@example.com", password }),
  });
  const body = (await response.json()) as { token: string };
  return body.token;
}

export type Theme = "light" | "dark" | "system";

/** Opens a screen with the cookie banner answered, a theme chosen and, when asked, the dev account signed in. */
export async function openScreen(page: Page, screen: Screen, theme: Theme = "light") {
  const token = screen.signedIn ? await sessionToken() : null;
  await page.addInitScript(
    ([t, tk]) => {
      localStorage.setItem("theme", t as string);
      localStorage.setItem("cookie_consent", "accepted");
      if (tk) localStorage.setItem("auth_token", tk);
    },
    [theme, token],
  );
  await page.goto(screen.path);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("body")).toBeVisible();
}

export const test = base;
export { expect };
