import { describe, it, expect, afterEach } from "vitest";
import Database from "better-sqlite3";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { seedSamples, SAMPLE_EXPIRES_AT } from "./seed-samples.js";
import { startTestApp } from "./test-app.js";
import { ListingsRepository } from "./repositories/listings.repo.js";

type TestApp = Awaited<ReturnType<typeof startTestApp>>;

describe("seed:samples", () => {
  let t: TestApp;
  afterEach(async () => {
    await t?.app.close();
  });

  async function seeded() {
    t = await startTestApp();
    const db = new Database(t.config.databasePath);
    const added = await seedSamples(db, { uploadsDir: t.config.uploadsDir, assetsDir: t.config.assetsDir });
    return { db, added };
  }

  it("adds nine samples with images, files and two reviews, and a rerun changes nothing", async () => {
    const { db, added } = await seeded();
    expect(added).toBe(9);
    expect(await seedSamples(db, { uploadsDir: t.config.uploadsDir, assetsDir: t.config.assetsDir })).toBe(0);
    const counts = db.prepare(`SELECT
      (SELECT count(*) FROM listings WHERE is_sample = 1) AS listings,
      (SELECT count(*) FROM listing_images) AS images,
      (SELECT count(*) FROM listing_assets) AS assets,
      (SELECT count(*) FROM reviews) AS reviews,
      (SELECT count(*) FROM users) AS users`).get();
    expect(counts).toEqual({ listings: 9, images: 9, assets: 9, reviews: 2, users: 3 });
    expect(existsSync(path.join(t.config.uploadsDir, "samples", "icons.png"))).toBe(true);
    const zip = path.join(t.config.assetsDir, "samples", "sample-icons", "iconite-svg.zip");
    expect(statSync(zip).size).toBeGreaterThan(60_000);
    // The files for sale are not under the public folder.
    expect(existsSync(path.join(t.config.uploadsDir, "samples", "sample-icons"))).toBe(false);
  });

  it("shows the samples publicly, and their sellers cannot sign in", async () => {
    await seeded();
    const page = (await t.app.inject({ method: "GET", url: "/listings?per_page=50" })).json();
    expect(page.total_count).toBe(9);
    const login = await t.app.inject({ method: "POST", url: "/auth/login", payload: { email: "studio@sample.piataro.invalid", password: "anything-at-all" } });
    expect(login.statusCode).toBe(401);
  });

  it("never lets a sample expire, and sends it no reminder", async () => {
    const { db } = await seeded();
    expect(SAMPLE_EXPIRES_AT.startsWith("9999")).toBe(true);
    const aYearOn = db.prepare("SELECT count(*) AS n FROM listings WHERE is_sample = 1 AND expires_at > datetime('now', '+1 year')").get();
    expect(aYearOn).toEqual({ n: 9 });
    db.prepare("UPDATE users SET email_notifications = 1").run();
    expect(await new ListingsRepository(t.ctx.db).getDueExpiryReminders()).toEqual([]);
  });
});
