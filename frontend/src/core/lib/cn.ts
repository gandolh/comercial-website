import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge, told this app's own @theme names (index.css), so `cn("text-on-surface", "text-primary")` keeps
 * only the later colour while `cn("font-headline", "font-bold")` keeps both (a family and a weight). Keep the lists
 * in step with @theme when a token is added.
 *
 * A size must not drop a `leading-*`: in Tailwind 4 a `leading-*` utility always wins over the line height a `text-*`
 * size carries, so the two never conflict, which tailwind-merge does not know.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      font: ["headline", "body", "label"],
      shadow: ["ambient", "band", "bar", "card", "focus", "focus-error", "popup", "search"],
      radius: ["control"],
      text: ["hero", "title", "price", "body", "card-title", "control", "label"],
    },
    classGroups: {
      z: [{ z: ["nav", "overlay", "popup", "toast"] }],
    },
  },
  override: {
    conflictingClassGroups: { "font-size": [] },
  },
});

/** Joins class names, and lets a later class win over an earlier one it conflicts with. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
