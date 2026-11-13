import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Every text and icon pair the redesign draws, measured over the stylesheet's own tokens in both themes. Text
// needs 4.5:1 (3:1 for large text); a UI part (an edge, a ring, a switch) needs 3:1. Set CONTRAST_REPORT=1 to print
// the table the outcome note quotes.
const css = readFileSync(new URL("index.css", import.meta.url), "utf8");
const lightBlock = css.slice(css.indexOf("@theme"), css.indexOf("/* Typography"));
const darkBlock = css.slice(css.indexOf(':root[data-theme="dark"]'), css.indexOf("@layer base"));

function role(block: string, name: string): string {
  const match = block.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match?.[1]) throw new Error(`no --color-${name} in the block`);
  return match[1].toLowerCase();
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

type Kind = "text" | "large" | "ui";
const MIN: Record<Kind, number> = { text: 4.5, large: 3, ui: 3 };

const PAIRS: [fg: string, bg: string, kind: Kind][] = [
  // Body text on the grounds the screens use
  ...(["background", "surface-container-lowest", "surface-container-low", "surface-container"] as const).flatMap(
    (bg): [string, string, Kind][] => [
      ["on-surface", bg, "text"],
      ["on-surface-variant", bg, "text"],
    ],
  ),
  ["primary", "background", "text"],
  ["primary", "surface-container-lowest", "text"],
  ["primary", "surface-container-low", "text"],
  ["on-primary-fixed", "primary-fixed", "text"],
  ["on-primary", "primary", "text"],
  ["on-primary", "primary-container", "text"],
  ["on-primary-container", "primary-container", "text"],
  ["on-secondary-container", "secondary-container", "text"],
  ["on-secondary", "secondary", "text"],
  ["on-fill", "tertiary-container", "text"],
  ["on-tertiary-container", "tertiary-container", "text"],
  ["tertiary", "surface-container-lowest", "text"],
  ["on-error", "error", "text"],
  ["on-error-container", "error-container", "text"],
  ["error", "background", "text"],
  ["error", "surface-container-lowest", "text"],
  ["inverse-on-surface", "inverse-surface", "text"],
  ["inverse-primary", "inverse-surface", "text"],
  // The navy shell
  ["on-nav-band", "nav-band", "text"],
  ["on-nav-band-variant", "nav-band", "text"],
  ["nav-band", "on-nav-band", "text"],
  // The footer wordmark (large, bold)
  ["secondary", "surface-container", "large"],
  // UI parts: field and switch edges, rings, the slider thumb
  ["outline", "background", "ui"],
  ["outline", "surface-container-lowest", "ui"],
  ["outline", "surface-container-low", "ui"],
  ["primary", "surface-container-lowest", "ui"],
  ["primary", "surface-container-low", "ui"],
  ["primary", "primary-fixed", "ui"],
  ["tertiary", "surface-container-low", "ui"],
  ["on-fill", "tertiary-container", "ui"],
  ["on-nav-band-variant", "nav-band", "ui"],
];

const themes = { light: lightBlock, dark: darkBlock } as const;

describe.each(Object.entries(themes))("contrast, %s theme", (theme, block) => {
  const lightBase = lightBlock;
  // The dark block redefines the roles; a role it leaves alone (none today) would fall back to the light value.
  const read = (name: string) => {
    try {
      return role(block, name);
    } catch {
      return role(lightBase, name);
    }
  };

  it.each(PAIRS)("%s on %s clears its minimum", (fg, bg, kind) => {
    const ratio = contrast(read(fg), read(bg));
    expect(ratio, `${fg} on ${bg} (${kind})`).toBeGreaterThanOrEqual(MIN[kind]);
  });

  it("lists the minimums", () => {
    const byKind = (kind: Kind) =>
      Math.min(...PAIRS.filter(([, , k]) => k === kind).map(([fg, bg]) => contrast(read(fg), read(bg))));
    if (process.env.CONTRAST_REPORT) {
      console.log(
        `${theme}: ${PAIRS.length} pairs, text min ${byKind("text").toFixed(2)}, large min ${byKind("large").toFixed(2)}, UI min ${byKind("ui").toFixed(2)}`,
      );
    }
    expect(byKind("text")).toBeGreaterThanOrEqual(MIN.text);
  });
});
