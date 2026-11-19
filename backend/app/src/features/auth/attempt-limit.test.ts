import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { hashPassword } from "../../lib/tokens.js";
import { startTestApp } from "../../testing/test-app.js";
import type { WardClient } from "../../../vendor/ward/ward-auth.js";

type TestApp = Awaited<ReturnType<typeof startTestApp>>;

const PASSWORD = "the-right-password";
const MIN = 60_000;
/** Link-ticket only needs a Ward client to exist. */
const stubWard = { redirectUri: "http://localhost:8080/auth/ward/callback" } as unknown as WardClient;

/** Wrong password tries are limited on the three routes that check the owner's password (brief 20). */
describe("wrong password tries are limited", () => {
  let t: TestApp;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    t = await startTestApp({}, stubWard);
    await t.ctx.db
      .insertInto("users")
      .values({ id: "u1", email: "u1@test.ro", password_hash: await hashPassword(PASSWORD) })
      .execute();
  });
  afterEach(async () => {
    vi.useRealTimers();
    await t.app.close();
  });

  // The change sets the same password again, so a right try leaves the account as it was.
  // Each helper sends one try from `address` (a remote that is not a trusted proxy, so it is request.ip).
  const login = (password: string, address = "10.0.0.1", email = "u1@test.ro") =>
    t.app.inject({ method: "POST", url: "/auth/login", remoteAddress: address, payload: { email, password } });
  const change = (password: string, address = "10.0.0.1") =>
    t.app.inject({
      method: "PATCH",
      url: "/users/me/password",
      remoteAddress: address,
      headers: t.bearer("u1"),
      payload: { current_password: password, new_password: PASSWORD },
    });
  const ticket = (password: string, address = "10.0.0.1") =>
    t.app.inject({
      method: "POST",
      url: "/auth/ward/link-ticket",
      remoteAddress: address,
      headers: t.bearer("u1"),
      payload: { current_password: password },
    });
  const routes = { login, change, ticket } as const;

  for (const [name, wrongStatus] of [
    ["login", 401],
    ["change", 403],
    ["ticket", 403],
  ] as const) {
    describe(`the ${name} route`, () => {
      const send = routes[name];

      it("refuses even the right password after 10 wrong tries, with Retry-After", async () => {
        for (let i = 0; i < 10; i++) expect((await send("wrong")).statusCode).toBe(wrongStatus);
        const res = await send(PASSWORD);
        expect([res.statusCode, res.headers["retry-after"], res.json()]).toEqual([
          429,
          "900",
          { error: "rate limit exceeded" },
        ]);
      });

      it("works again once the 15 minutes have passed", async () => {
        for (let i = 0; i < 10; i++) await send("wrong");
        vi.advanceTimersByTime(15 * MIN - 1000);
        expect((await send(PASSWORD)).statusCode).toBe(429);
        vi.advanceTimersByTime(1000);
        expect((await send(PASSWORD)).statusCode).toBe(200);
      });

      it("counts addresses apart", async () => {
        for (let i = 0; i < 10; i++) await send("wrong", "10.0.0.1");
        expect((await send(PASSWORD, "10.0.0.1")).statusCode).toBe(429);
        expect((await send(PASSWORD, "10.0.0.2")).statusCode).toBe(200);
      });

      it("clears the address's count on a right password (two rounds stay under the account cap)", async () => {
        for (let round = 0; round < 2; round++) {
          for (let i = 0; i < 9; i++) await send("wrong");
          expect((await send(PASSWORD)).statusCode).toBe(200);
        }
      });

      it("stops an account at 20 wrong tries an hour across addresses", async () => {
        for (let a = 1; a <= 4; a++) for (let i = 0; i < 5; i++) await send("wrong", `10.0.1.${a}`);
        const res = await send(PASSWORD, "10.0.2.1");
        expect([res.statusCode, res.headers["retry-after"]]).toEqual([429, "3600"]);
        vi.advanceTimersByTime(60 * MIN);
        expect((await send(PASSWORD, "10.0.2.1")).statusCode).toBe(200);
      });
    });
  }

  it("shares the budget between the three routes", async () => {
    for (let i = 0; i < 4; i++) await login("wrong");
    for (let i = 0; i < 3; i++) await change("wrong");
    for (let i = 0; i < 3; i++) await ticket("wrong");
    expect((await login(PASSWORD)).statusCode).toBe(429);
    expect((await change(PASSWORD)).statusCode).toBe(429);
    expect((await ticket(PASSWORD)).statusCode).toBe(429);
  });

  it("counts an unknown email against the address only", async () => {
    for (let i = 0; i < 10; i++) expect((await login("x", "10.0.0.1", "nobody@test.ro")).statusCode).toBe(401);
    expect((await login(PASSWORD, "10.0.0.1")).statusCode).toBe(429);
    // 20 unknown-email tries from other addresses leave the account's own budget untouched
    for (let a = 1; a <= 4; a++) for (let i = 0; i < 5; i++) await login("x", `10.0.3.${a}`, "nobody@test.ro");
    expect((await login(PASSWORD, "10.0.4.1")).statusCode).toBe(200);
  });
});
