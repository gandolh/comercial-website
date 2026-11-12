import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("lets the later of two custom colours win", () => {
    expect(cn("text-on-surface", "text-primary")).toBe("text-primary");
    expect(cn("bg-surface-container-high", "bg-surface-container-lowest")).toBe("bg-surface-container-lowest");
  });

  it("keeps a font family and a weight, which the theme names itself", () => {
    expect(cn("font-headline", "font-bold")).toBe("font-headline font-bold");
    expect(cn("font-headline", "font-body")).toBe("font-body");
  });

  it("keeps a line height when a size follows it", () => {
    expect(cn("leading-none", "text-sm")).toBe("leading-none text-sm");
  });

  it("tells a shadow token and a z token from their neighbours", () => {
    expect(cn("shadow-ambient", "shadow-focus")).toBe("shadow-focus");
    expect(cn("z-nav", "z-popup")).toBe("z-popup");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("drops what is false", () => {
    const hidden = false;
    expect(cn("p-2", hidden && "opacity-50")).toBe("p-2");
  });
});
