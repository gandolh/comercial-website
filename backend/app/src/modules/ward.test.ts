import { describe, it, expect, afterEach } from "vitest";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runMigrations, verifyPassword } from "@my-olx/core";
import { startTestApp } from "../test-app.js";
import { createOwner } from "../create-owner.js";
import type { WardClient } from "../../vendor/ward/ward-auth.js";

type TestApp = Awaited<ReturnType<typeof startTestApp>>;

/** A Ward that "verifies" whatever subject the callback's `sub` parameter names. */
const fakeWard = {
  issuer: "https://ward.test/oidc",
  clientId: "piataro",
  redirectUri: "http://localhost:8080/auth/ward/callback",
  async startAuthorization() {
    return { url: "https://ward.test/oidc/authorize?state=s1", flow: { state: "s1", nonce: "n1", codeVerifier: "v1" } };
  },
  async finishAuthorization(search: string) {
    const sub = new URLSearchParams(search).get("sub");
    if (!sub) throw Object.assign(new Error("bad"), { code: "invalid_response" });
    return { subject: sub, username: "owner", role: "user", wardSid: "sid", idToken: "t" };
  },
  async checkSession() {
    return { active: true as const, role: "user" };
  },
  async sendNotification() {
    return { sent: false };
  },
  async endSessionUrl() {
    return "https://ward.test/oidc/logout";
  },
} as unknown as WardClient;

const cookieOf = (res: { headers: Record<string, unknown> }) => String(res.headers["set-cookie"]).split(";")[0];

describe("sign-in for the owner only", () => {
  let t: TestApp;
  afterEach(async () => {
    await t?.app.close();
  });

  it("refuses registration", async () => {
    t = await startTestApp();
    const res = await t.app.inject({ method: "POST", url: "/auth/register", payload: { email: "a@b.ro", password: "longpassword1", display_name: "A" } });
    expect(res.statusCode).toBe(403);
  });

  it("reports Ward off without its settings", async () => {
    t = await startTestApp();
    expect((await t.app.inject({ method: "GET", url: "/auth/ward/status" })).json()).toEqual({ enabled: false });
    expect((await t.app.inject({ method: "GET", url: "/auth/ward/start" })).statusCode).toBe(404);
  });

  it("links Ward from Settings, then signs in by the subject", async () => {
    t = await startTestApp({}, fakeWard);
    await t.ctx.db.insertInto("users").values({ id: "owner", email: "owner@test.ro", password_hash: "x", email_verified: 1 }).execute();

    const ticket = (await t.app.inject({ method: "POST", url: "/auth/ward/link-ticket", headers: t.bearer("owner") })).json().ticket;
    const start = await t.app.inject({ method: "GET", url: `/auth/ward/start?link=${ticket}` });
    expect(start.statusCode).toBe(302);
    expect(start.headers.location).toBe("https://ward.test/oidc/authorize?state=s1");
    const linked = await t.app.inject({ method: "GET", url: "/auth/ward/callback?code=c&state=s1&sub=ward-owner", headers: { cookie: cookieOf(start) } });
    expect(linked.headers.location).toBe("http://localhost:5173/cont/setari?ward=linked");
    const me = await t.app.inject({ method: "GET", url: "/users/me", headers: t.bearer("owner") });
    expect(me.json().ward_linked).toBe(true);

    const signIn = await t.app.inject({ method: "GET", url: "/auth/ward/start" });
    const back = await t.app.inject({ method: "GET", url: "/auth/ward/callback?code=c&state=s1&sub=ward-owner", headers: { cookie: cookieOf(signIn) } });
    const location = String(back.headers.location);
    expect(location.startsWith("http://localhost:5173/autentificare/ward#token=")).toBe(true);
    const token = decodeURIComponent(location.split("#token=")[1]!);
    const meByWard = await t.app.inject({ method: "GET", url: "/users/me", headers: { authorization: `Bearer ${token}` } });
    expect(meByWard.json().id).toBe("owner");
  });

  it("refuses a Ward account nobody linked, a callback without its flow, and a reused ticket", async () => {
    t = await startTestApp({}, fakeWard);
    await t.ctx.db.insertInto("users").values({ id: "owner", email: "owner@test.ro", password_hash: "x", email_verified: 1 }).execute();
    const start = await t.app.inject({ method: "GET", url: "/auth/ward/start" });
    const stranger = await t.app.inject({ method: "GET", url: "/auth/ward/callback?code=c&state=s1&sub=someone-else", headers: { cookie: cookieOf(start) } });
    expect(stranger.headers.location).toBe("http://localhost:5173/autentificare?ward_error=not_linked");
    const noFlow = await t.app.inject({ method: "GET", url: "/auth/ward/callback?code=c&state=s1&sub=x" });
    expect(noFlow.headers.location).toBe("http://localhost:5173/autentificare?ward_error=expired");

    const ticket = (await t.app.inject({ method: "POST", url: "/auth/ward/link-ticket", headers: t.bearer("owner") })).json().ticket;
    await t.app.inject({ method: "GET", url: `/auth/ward/start?link=${ticket}` });
    const reused = await t.app.inject({ method: "GET", url: `/auth/ward/start?link=${ticket}` });
    expect(reused.headers.location).toBe("http://localhost:5173/cont/setari?ward_error=expired_link");
  });
});

describe("createOwner", () => {
  it("creates the owner once and updates them after", async () => {
    const db = new Database(":memory:");
    const here = path.dirname(fileURLToPath(import.meta.url));
    runMigrations(db, path.resolve(here, "../../../migrations"));
    expect(await createOwner(db, { email: "Owner@Test.ro", password: "first-password-1", name: "Owner" })).toBe("created");
    expect(await createOwner(db, { email: "owner@test.ro", password: "second-password-2", name: "The Owner" })).toBe("updated");
    const rows = db.prepare("SELECT email, display_name, email_verified, password_hash FROM users").all() as {
      email: string; display_name: string; email_verified: number; password_hash: string;
    }[];
    expect(rows).toHaveLength(1);
    expect(rows[0]!.email).toBe("owner@test.ro");
    expect(rows[0]!.display_name).toBe("The Owner");
    expect(rows[0]!.email_verified).toBe(1);
    expect(await verifyPassword(rows[0]!.password_hash, "second-password-2")).toBe(true);
  });

  it("leaves an existing owner alone with ifMissing", async () => {
    const db = new Database(":memory:");
    const here = path.dirname(fileURLToPath(import.meta.url));
    runMigrations(db, path.resolve(here, "../../../migrations"));
    const owner = { email: "owner@test.ro", password: "first-password-1", name: "Owner" };
    expect(await createOwner(db, owner, { ifMissing: true })).toBe("created");
    expect(await createOwner(db, { ...owner, password: "second-password-2" }, { ifMissing: true })).toBe("kept");
    const row = db.prepare("SELECT password_hash FROM users").get() as { password_hash: string };
    expect(await verifyPassword(row.password_hash, "first-password-1")).toBe(true);
  });
});
