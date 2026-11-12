import { describe, it, expect, afterEach } from "vitest";
import Database from "better-sqlite3";
import { startTestApp } from "../../testing/test-app.js";

type TestApp = Awaited<ReturnType<typeof startTestApp>>;

// GET /invoices/profile answers the stored row itself (selectAll), so it shows what a response schema does
// to a row: a column the schema doesn't name never leaves the server, and a stored value the schema refuses
// is a logged 500 with no detail, never the row.
describe("the replies through their response schemas", () => {
  let t: TestApp;
  afterEach(async () => {
    await t?.app.close();
  });

  const userId = "00000000000000000000000000000077";
  async function withProfile() {
    t = await startTestApp();
    const db = new Database(t.config.databasePath);
    db.prepare("INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)").run(
      userId,
      "profile@example.com",
      "!no-sign-in",
      "Profile",
    );
    const put = await t.app.inject({
      method: "PUT",
      url: "/invoices/profile",
      headers: t.bearer(userId),
      payload: { company_name: "Firma SRL", cui: "RO123" },
    });
    expect(put.statusCode).toBe(200);
    return db;
  }

  it("strips a column the schema doesn't name", async () => {
    const db = await withProfile();
    db.exec("ALTER TABLE user_invoice_profiles ADD COLUMN internal_note TEXT DEFAULT 'not for clients'");
    db.close();
    const res = await t.app.inject({ method: "GET", url: "/invoices/profile", headers: t.bearer(userId) });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ company_name: "Firma SRL", cui: "RO123" });
    expect(res.body).not.toContain("internal_note");
    expect(res.body).not.toContain("not for clients");
  });

  it("answers a stored value its schema refuses with a 500 and no detail", async () => {
    const db = await withProfile();
    db.prepare("UPDATE user_invoice_profiles SET company_name = x'0102' WHERE user_id = ?").run(userId);
    db.close();
    const res = await t.app.inject({ method: "GET", url: "/invoices/profile", headers: t.bearer(userId) });
    expect([res.statusCode, res.json()]).toEqual([500, { error: "internal error" }]);
  });
});
