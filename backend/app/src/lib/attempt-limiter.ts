/**
 * Limits wrong password tries, in memory (the API is one process; a restart clears it, as the Ward flows
 * do). No Fastify here: the routes that check a password ask `retryAfter` first and report with `fail`.
 *
 * Two budgets, each a sliding window of the times of wrong tries:
 * - per address: 10 in 15 minutes;
 * - per account: 20 in an hour, across addresses.
 *
 * While either is full, `retryAfter` answers the seconds until a slot frees up, and the caller refuses even
 * the right password. A refused request is not a wrong try, so waiting is never made longer by trying.
 * A right password clears its address's count (`clear`); the account's stays.
 */
export interface AttemptLimits {
  addressMax: number;
  addressWindowMs: number;
  accountMax: number;
  accountWindowMs: number;
}

export const DEFAULT_ATTEMPT_LIMITS: AttemptLimits = {
  addressMax: 10,
  addressWindowMs: 15 * 60_000,
  accountMax: 20,
  accountWindowMs: 60 * 60_000,
};

const SWEEP_EVERY_MS = 60_000;

export class AttemptLimiter {
  private readonly byAddress = new Map<string, number[]>();
  private readonly byAccount = new Map<string, number[]>();
  private lastSweep = 0;

  private readonly limits: AttemptLimits;
  private readonly now: () => number;

  constructor(limits: AttemptLimits = DEFAULT_ATTEMPT_LIMITS, now: () => number = () => Date.now()) {
    this.limits = limits;
    this.now = now;
  }

  /** Seconds to wait (rounded up, at least 1) while `address` or `accountId` is over its limit; 0 when free. */
  retryAfter(address: string, accountId?: string): number {
    const now = this.now();
    const waits = [
      this.waitMs(this.byAddress, address, this.limits.addressMax, this.limits.addressWindowMs, now),
      accountId === undefined
        ? 0
        : this.waitMs(this.byAccount, accountId, this.limits.accountMax, this.limits.accountWindowMs, now),
    ];
    const wait = Math.max(...waits);
    return wait > 0 ? Math.max(1, Math.ceil(wait / 1000)) : 0;
  }

  /** Records a wrong try from `address`, against `accountId` when the account is known. */
  fail(address: string, accountId?: string): void {
    const now = this.now();
    this.sweep(now);
    this.push(this.byAddress, address, now);
    if (accountId !== undefined) this.push(this.byAccount, accountId, now);
  }

  /** A right password from `address`: its count starts again. */
  clear(address: string): void {
    this.byAddress.delete(address);
  }

  private push(map: Map<string, number[]>, key: string, now: number): void {
    const times = map.get(key);
    if (times) times.push(now);
    else map.set(key, [now]);
  }

  /** Milliseconds until the key is under its max again, 0 when it already is. */
  private waitMs(map: Map<string, number[]>, key: string, max: number, windowMs: number, now: number): number {
    const times = map.get(key)?.filter((t) => t > now - windowMs);
    if (!times) return 0;
    map.set(key, times);
    if (times.length < max) return 0;
    // The (length - max + 1)th oldest try must leave the window before one more is allowed.
    const blocking = times[times.length - max];
    return (blocking ?? now) + windowMs - now;
  }

  /** Drops keys with no try left in their window, at most once a minute, so the maps stay small. */
  private sweep(now: number): void {
    if (now - this.lastSweep < SWEEP_EVERY_MS) return;
    this.lastSweep = now;
    for (const [map, windowMs] of [
      [this.byAddress, this.limits.addressWindowMs],
      [this.byAccount, this.limits.accountWindowMs],
    ] as const) {
      for (const [key, times] of map) {
        if (times.every((t) => t <= now - windowMs)) map.delete(key);
      }
    }
  }
}
