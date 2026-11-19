import { describe, it, expect } from "vitest";
import { AttemptLimiter, DEFAULT_ATTEMPT_LIMITS } from "./attempt-limiter.js";

const MIN = 60_000;

function setup() {
  let t = 1_000_000;
  const limiter = new AttemptLimiter(DEFAULT_ATTEMPT_LIMITS, () => t);
  return { limiter, advance: (ms: number) => (t += ms) };
}

describe("AttemptLimiter", () => {
  it("allows 9 wrong tries from an address and blocks at the 10th", () => {
    const { limiter } = setup();
    for (let i = 0; i < 9; i++) limiter.fail("a");
    expect(limiter.retryAfter("a")).toBe(0);
    limiter.fail("a");
    expect(limiter.retryAfter("a")).toBe(15 * 60);
  });

  it("frees the address when the oldest try leaves the 15-minute window", () => {
    const { limiter, advance } = setup();
    limiter.fail("a");
    advance(MIN);
    for (let i = 0; i < 9; i++) limiter.fail("a");
    expect(limiter.retryAfter("a")).toBe(14 * 60);
    advance(14 * MIN - 1);
    expect(limiter.retryAfter("a")).toBe(1);
    advance(1);
    expect(limiter.retryAfter("a")).toBe(0);
  });

  it("rounds the wait up to whole seconds, at least one", () => {
    const { limiter, advance } = setup();
    for (let i = 0; i < 10; i++) limiter.fail("a");
    advance(15 * MIN - 1500);
    expect(limiter.retryAfter("a")).toBe(2);
    advance(1400);
    expect(limiter.retryAfter("a")).toBe(1);
  });

  it("counts addresses apart", () => {
    const { limiter } = setup();
    for (let i = 0; i < 10; i++) limiter.fail("a");
    expect(limiter.retryAfter("a")).toBeGreaterThan(0);
    expect(limiter.retryAfter("b")).toBe(0);
  });

  it("caps an account across addresses at 20 an hour", () => {
    const { limiter, advance } = setup();
    // two tries each from ten addresses: none is over its own budget
    for (let i = 0; i < 10; i++) {
      limiter.fail(`addr${i}`, "u1");
      limiter.fail(`addr${i}`, "u1");
    }
    expect(limiter.retryAfter("fresh", "u1")).toBe(60 * 60);
    expect(limiter.retryAfter("fresh", "u2")).toBe(0);
    expect(limiter.retryAfter("fresh")).toBe(0);
    advance(60 * MIN);
    expect(limiter.retryAfter("fresh", "u1")).toBe(0);
  });

  it("reports the longer of the two waits", () => {
    const { limiter, advance } = setup();
    for (let i = 0; i < 10; i++) limiter.fail("a", "u1");
    advance(10 * MIN);
    expect(limiter.retryAfter("a", "u1")).toBe(5 * 60);
    for (let i = 0; i < 10; i++) limiter.fail("b", "u1");
    // the account is full now: its oldest try was 10 minutes ago, so 50 minutes remain
    expect(limiter.retryAfter("c", "u1")).toBe(50 * 60);
  });

  it("clears the address on a success but keeps the account's count", () => {
    const { limiter } = setup();
    for (let i = 0; i < 9; i++) limiter.fail("a", "u1");
    limiter.clear("a");
    limiter.fail("a", "u1");
    expect(limiter.retryAfter("a", "u1")).toBe(0);
    for (let i = 0; i < 10; i++) limiter.fail("b", "u1");
    expect(limiter.retryAfter("c", "u1")).toBeGreaterThan(0);
  });

  it("forgets idle keys", () => {
    const { limiter, advance } = setup();
    limiter.fail("a", "u1");
    advance(2 * 60 * MIN);
    limiter.fail("b");
    expect(limiter.retryAfter("a", "u1")).toBe(0);
  });
});
