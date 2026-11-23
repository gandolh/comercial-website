const NUMERALS: readonly (readonly [number, string])[] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/** A whole number from 1 to 3999 in Roman numerals (the footer's year: 2026 is MMXXVI). */
export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999)
    throw new RangeError(`toRoman takes a whole number from 1 to 3999, not ${n}`);
  let rest = n;
  let out = "";
  for (const [value, letters] of NUMERALS) {
    while (rest >= value) {
      out += letters;
      rest -= value;
    }
  }
  return out;
}
