/**
 * Limits wrong password tries, in memory (the API is one process; a restart clears it, as the Ward flows
 * do). No Fastify here: the routes that check a password ask `retryAfter` first and report with `fail`.
 *
 * Two budgets, each a sliding window of the times of wrong tries:
 * - per address: 10 in 15 minutes;
 * - per account: 20 in an hour, across addresses.
 *
 * While either is full, `begin` answers the seconds until a slot frees up, and the caller refuses even
 * the right password. A refused request is not a wrong try, so waiting is never made longer by trying.
 * The try is counted when `begin` runs, before the slow password check, so a burst cannot outrun the limit.
 * A right password clears its address's count and gives back its own account try; the account's earlier
 * wrong tries stay.
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

/** One counted try, from `begin`. */
export interface Attempt {
  /** The password was right: the address's count clears and the account takes this try back. */
  succeed(): void;
  /** The password was wrong: both counts keep the try (it is counted already). */
  failed(): void;
}

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

  /**
   * Checks the limits and counts the try in one step, before the password is checked, so tries sent at
   * once cannot all pass the check ahead of the first count. Answers the seconds to wait while `address` or
   * `accountId` is over its limit (the try is then not counted), else a handle: call `succeed()` on a right
   * password and `failed()` on a wrong one. A handle never settled counts as a wrong try.
   */
  begin(address: string, accountId?: string): number | Attempt {
    const wait = this.retryAfter(address, accountId);
    if (wait > 0) return wait;
    const now = this.now();
    this.sweep(now);
    this.push(this.byAddress, address, now);
    if (accountId !== undefined) this.push(this.byAccount, accountId, now);
    return {
      succeed: () => {
        // The address starts again; the account gets this try back, its earlier wrong ones stay.
        this.byAddress.delete(address);
        if (accountId !== undefined) this.unpush(this.byAccount, accountId, now);
      },
      failed: () => {},
    };
  }

  private unpush(map: Map<string, number[]>, key: string, time: number): void {
    const times = map.get(key);
    const at = times?.indexOf(time) ?? -1;
    if (times && at >= 0) times.splice(at, 1);
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
