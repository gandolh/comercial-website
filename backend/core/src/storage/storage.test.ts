import { describe, it, expect } from "vitest";
import { listingImageKey, listingAssetKey, StorageService } from "./index.js";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

describe("Storage Module", () => {
  describe("listingImageKey", () => {
    it("generates a key matching listings/{id}/{uuid}.{ext}", () => {
      const key = listingImageKey("abc", "jpg");
      expect(key).toMatch(/^listings\/abc\/[0-9a-f-]+\.jpg$/);
    });

    it("generates different keys for multiple calls", () => {
      const key1 = listingImageKey("abc", "jpg");
      const key2 = listingImageKey("abc", "jpg");
      expect(key1).not.toBe(key2);
    });
  });

  describe("listingAssetKey", () => {
    it("starts with listings/{id}/assets/", () => {
      const key = listingAssetKey("abc", "test.zip");
      expect(key).toMatch(/^listings\/abc\/assets\//);
    });

    it("sanitizes filename with no spaces or special chars", () => {
      const key = listingAssetKey("abc", "My File!.zip");
      expect(key).not.toContain(" ");
      expect(key).not.toContain("!");
      expect(key).toMatch(/listings\/abc\/assets\/[0-9a-f-]+-My_File_\.zip$/);
    });

    it("preserves valid filename characters", () => {
      const key = listingAssetKey("abc", "doc_v1.2-final.pdf");
      expect(key).toContain("doc_v1.2-final.pdf");
    });
  });

  describe("StorageService.publicUrl", () => {
    it("concatenates publicBaseUrl with /uploads/ prefix and key", () => {
      const service = new StorageService({
        uploadsDir: "/tmp/uploads",
        publicBaseUrl: "https://cdn.example.com",
      });
      const url = service.publicUrl("listings/abc/test.jpg");
      expect(url).toBe("https://cdn.example.com/listings/abc/test.jpg");
    });
  });

  describe("StorageService.deleteObject", () => {
    it("does not throw when file does not exist", async () => {
      const uploadsDir = await mkdtemp(path.join(tmpdir(), "my-olx-test-"));
      try {
        const service = new StorageService({ uploadsDir, publicBaseUrl: "http://localhost" });
        await expect(service.deleteObject("nonexistent/file.txt")).resolves.not.toThrow();
      } finally {
        await rm(uploadsDir, { recursive: true });
      }
    });
  });
});
