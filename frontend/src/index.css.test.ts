import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEME_COLORS } from "@core/lib/theme";

// Read as text: the build rewrites the stylesheet (Tailwind drops unused variables), and this checks the source.
const css = readFileSync(new URL("index.css", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");

/** The value of a colour role in one block of the stylesheet. */
function role(block: string, name: string): string {
  const match = block.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match?.[1]) throw new Error(`no --color-${name} in the block`);
  return match[1].toLowerCase();
}

const light = css.slice(css.indexOf("@theme"), css.indexOf("/* Typography"));
const dark = css.slice(css.indexOf(':root[data-theme="dark"]'), css.indexOf("@layer base"));

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

describe("the dark theme", () => {
  it("keys dark: off data-theme, and has no media query for the colours", () => {
    expect(css).toMatch(/@custom-variant dark \(&:where\(\[data-theme=dark\]/);
    expect(css).not.toContain("prefers-color-scheme");
  });

  it("sets color-scheme from the attribute, in this stylesheet", () => {
    expect(css).toMatch(/:root \{\s*color-scheme: light;/);
    expect(css).toMatch(/:root\[data-theme="dark"\] \{\s*color-scheme: dark;/);
  });

  it("keeps the light roles the designs set", () => {
    expect(role(light, "primary")).toBe("#1a5f9e");
    expect(role(light, "surface")).toBe("#f2f2ee");
    expect(role(light, "surface-container-lowest")).toBe("#fefefc");
  });

  it.each([
    ["on-surface", "surface"],
    ["on-surface", "surface-container"],
    ["on-surface-variant", "surface"],
    ["on-surface-variant", "surface-container-high"],
    ["outline", "surface"],
    ["primary", "surface"],
    ["secondary", "surface"],
    ["tertiary", "surface"],
    ["error", "surface"],
    ["on-primary", "primary"],
    ["on-primary-container", "primary-container"],
    ["on-secondary-container", "secondary-container"],
    ["on-tertiary-container", "tertiary-container"],
    ["on-error", "error"],
    ["on-error-container", "error-container"],
    ["on-primary-fixed", "primary-fixed"],
    ["on-fill", "tertiary-container"],
    ["inverse-on-surface", "inverse-surface"],
  ])("reads %s on %s at 4.5:1 in the dark theme", (text, surface) => {
    expect(contrast(role(dark, text), role(dark, surface))).toBeGreaterThanOrEqual(4.5);
  });
});

describe("the browser-bar colour", () => {
  it("is the background role of each theme, in the stylesheet, the boot script and the store", () => {
    expect(THEME_COLORS.light).toBe(role(light, "background"));
    expect(THEME_COLORS.dark).toBe(role(dark, "background"));
    expect(indexHtml).toContain(`"${THEME_COLORS.light}"`);
    expect(indexHtml).toContain(`"${THEME_COLORS.dark}"`);
    expect(indexHtml).toContain('<meta name="theme-color"');
  });
});
