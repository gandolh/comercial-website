import { describe, it, expect } from "vitest";
import { AttemptLimiter, DEFAULT_ATTEMPT_LIMITS, type Attempt } from "./attempt-limiter.js";

const MIN = 60_000;

function setup() {
  let t = 1_000_000;
  const limiter = new AttemptLimiter(DEFAULT_ATTEMPT_LIMITS, () => t);
  return { limiter, advance: (ms: number) => (t += ms) };
}

/** One counted wrong try. */
function fail(limiter: AttemptLimiter, address: string, accountId?: string): void {
  const attempt = limiter.begin(address, accountId);
  if (typeof attempt === "number") throw new Error("limiter refused a try the test expected to count");
  attempt.failed();
}

function begin(limiter: AttemptLimiter, address: string, accountId?: string): Attempt {
  const attempt = limiter.begin(address, accountId);
  if (typeof attempt === "number") throw new Error(`refused for ${attempt}s`);
  return attempt;
}

describe("AttemptLimiter", () => {
  it("allows 9 wrong tries from an address and blocks at the 10th", () => {
    const { limiter } = setup();
    for (let i = 0; i < 9; i++) fail(limiter, "a");
    expect(limiter.retryAfter("a")).toBe(0);
    fail(limiter, "a");
    expect(limiter.retryAfter("a")).toBe(15 * 60);
  });

  it("frees the address when the oldest try leaves the 15-minute window", () => {
    const { limiter, advance } = setup();
    fail(limiter, "a");
    advance(MIN);
    for (let i = 0; i < 9; i++) fail(limiter, "a");
    expect(limiter.retryAfter("a")).toBe(14 * 60);
    advance(14 * MIN - 1);
    expect(limiter.retryAfter("a")).toBe(1);
    advance(1);
    expect(limiter.retryAfter("a")).toBe(0);
  });

  it("rounds the wait up to whole seconds, at least one", () => {
    const { limiter, advance } = setup();
    for (let i = 0; i < 10; i++) fail(limiter, "a");
    advance(15 * MIN - 1500);
    expect(limiter.retryAfter("a")).toBe(2);
    advance(1400);
    expect(limiter.retryAfter("a")).toBe(1);
  });

  it("counts addresses apart", () => {
    const { limiter } = setup();
    for (let i = 0; i < 10; i++) fail(limiter, "a");
    expect(limiter.retryAfter("a")).toBeGreaterThan(0);
    expect(limiter.retryAfter("b")).toBe(0);
  });

  it("caps an account across addresses at 20 an hour", () => {
    const { limiter, advance } = setup();
    // two tries each from ten addresses: none is over its own budget
    for (let i = 0; i < 10; i++) {
      fail(limiter, `addr${i}`, "u1");
      fail(limiter, `addr${i}`, "u1");
    }
    expect(limiter.retryAfter("fresh", "u1")).toBe(60 * 60);
    expect(limiter.retryAfter("fresh", "u2")).toBe(0);
    expect(limiter.retryAfter("fresh")).toBe(0);
    advance(60 * MIN);
    expect(limiter.retryAfter("fresh", "u1")).toBe(0);
  });

  it("reports the longer of the two waits", () => {
    const { limiter, advance } = setup();
    for (let i = 0; i < 10; i++) fail(limiter, "a", "u1");
    advance(10 * MIN);
    expect(limiter.retryAfter("a", "u1")).toBe(5 * 60);
    for (let i = 0; i < 10; i++) fail(limiter, "b", "u1");
    // the account is full now: its oldest try was 10 minutes ago, so 50 minutes remain
    expect(limiter.retryAfter("c", "u1")).toBe(50 * 60);
  });

  it("clears the address on a success but keeps the account's count", () => {
    const { limiter } = setup();
    for (let i = 0; i < 9; i++) fail(limiter, "a", "u1");
    begin(limiter, "a", "u1").succeed();
    // the address starts again, so it takes nine more; the account holds 9 wrong tries (not 10)
    for (let i = 0; i < 9; i++) fail(limiter, "a", "u1");
    expect(limiter.retryAfter("a", "u1")).toBe(0);
    // 18 on the account: two more fill it
    fail(limiter, "b", "u1");
    expect(limiter.retryAfter("c", "u1")).toBe(0);
    fail(limiter, "b", "u1");
    expect(limiter.retryAfter("c", "u1")).toBe(60 * 60);
  });

  it("counts a try when it begins, before it is settled", () => {
    const { limiter } = setup();
    // ten tries begun and not yet settled: the 11th is refused
    for (let i = 0; i < 10; i++) begin(limiter, "a", `u${i}`);
    expect(limiter.begin("a", "fresh")).toBe(15 * 60);
    // the account's budget fills the same way, across addresses
    for (let i = 0; i < 20; i++) begin(limiter, `x${i}`, "u99");
    expect(limiter.begin("y", "u99")).toBe(60 * 60);
  });

  it("does not count a refused try", () => {
    const { limiter, advance } = setup();
    for (let i = 0; i < 10; i++) fail(limiter, "a");
    for (let i = 0; i < 5; i++) expect(limiter.begin("a")).toBe(15 * 60);
    advance(15 * MIN);
    expect(limiter.begin("a")).not.toBeTypeOf("number");
  });

  it("gives the account its try back on a success, and keeps it on a failure", () => {
    const { limiter } = setup();
    for (let i = 0; i < 19; i++) fail(limiter, `x${i}`, "u1");
    begin(limiter, "p", "u1").succeed();
    expect(limiter.retryAfter("q", "u1")).toBe(0);
    begin(limiter, "p", "u1").failed();
    expect(limiter.retryAfter("q", "u1")).toBe(60 * 60);
  });

  it("counts an unknown account against the address only", () => {
    const { limiter } = setup();
    for (let i = 0; i < 25; i++) fail(limiter, `x${i}`);
    expect(limiter.retryAfter("fresh", "u1")).toBe(0);
    for (let i = 0; i < 10; i++) fail(limiter, "a");
    expect(limiter.retryAfter("a", "u1")).toBe(15 * 60);
    expect(limiter.retryAfter("b", "u1")).toBe(0);
  });

  it("forgets idle keys", () => {
    const { limiter, advance } = setup();
    fail(limiter, "a", "u1");
    advance(2 * 60 * MIN);
    fail(limiter, "b");
    // the sweep dropped them: the maps hold only what is still in a window
    const maps = limiter as unknown as { byAddress: Map<string, number[]>; byAccount: Map<string, number[]> };
    expect([...maps.byAddress.keys()]).toEqual(["b"]);
    expect(maps.byAccount.size).toBe(0);
  });
});
