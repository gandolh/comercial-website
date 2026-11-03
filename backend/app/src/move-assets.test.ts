import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { moveAssetsOutOfUploads } from "./move-assets.js";

describe("moveAssetsOutOfUploads", () => {
  it("moves asset files out of the public uploads folder and leaves images there", async () => {
    const root = mkdtempSync(path.join(tmpdir(), "assets-move-"));
    const uploads = path.join(root, "uploads");
    const assets = path.join(root, "assets");
    mkdirSync(path.join(uploads, "listings", "l1"), { recursive: true });
    writeFileSync(path.join(uploads, "listings", "l1", "pack.zip"), "paid");
    writeFileSync(path.join(uploads, "cover.jpg"), "image");
    const db = new Database(":memory:");
    db.exec("CREATE TABLE listing_assets (s3_key TEXT NOT NULL)");
    db.prepare("INSERT INTO listing_assets (s3_key) VALUES (?), (?)").run("listings/l1/pack.zip", "listings/l1/gone.zip");

    expect(await moveAssetsOutOfUploads(db, uploads, assets)).toBe(1);
    expect(existsSync(path.join(assets, "listings", "l1", "pack.zip"))).toBe(true);
    expect(existsSync(path.join(uploads, "listings", "l1", "pack.zip"))).toBe(false);
    expect(existsSync(path.join(uploads, "cover.jpg"))).toBe(true);
    // A second start finds nothing left to move.
    expect(await moveAssetsOutOfUploads(db, uploads, assets)).toBe(0);
  });
});
