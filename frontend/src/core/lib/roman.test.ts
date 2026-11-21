import { describe, expect, it } from "vitest";
import { toRoman } from "./roman";

describe("toRoman", () => {
  it.each([
    [2026, "MMXXVI"],
    [1999, "MCMXCIX"],
    [4, "IV"],
    [9, "IX"],
    [14, "XIV"],
    [40, "XL"],
    [90, "XC"],
    [400, "CD"],
    [900, "CM"],
    [3999, "MMMCMXCIX"],
  ])("writes %i as %s", (n, roman) => {
    expect(toRoman(n)).toBe(roman);
  });

  it.each([0, -1, 4000, 2.5, Number.NaN])("refuses %s", (n) => {
    expect(() => toRoman(n)).toThrow(RangeError);
  });
});
