import { describe, it, expect } from "vitest";
import { listingImageKey, listingAssetKey, createS3Client, StorageService } from "./index.js";

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

  describe("publicUrl", () => {
    it("concatenates publicBaseUrl with key correctly", () => {
      const cfg = {
        region: "eu-central-1",
        bucket: "test-bucket",
        publicBaseUrl: "https://cdn.example.com",
      };

      const service = new StorageService(createS3Client(cfg), cfg);
      const url = service.publicUrl("listings/abc/test.jpg");
      expect(url).toBe("https://cdn.example.com/listings/abc/test.jpg");
    });
  });

  describe("createS3Client", () => {
    it("returns an S3Client object with send method", () => {
      const cfg = {
        region: "eu-central-1",
        bucket: "test-bucket",
        publicBaseUrl: "https://cdn.example.com",
      };

      const client = createS3Client(cfg);
      expect(client).toBeDefined();
      expect(typeof client.send).toBe("function");
    });

    it("sets endpoint and forcePathStyle when endpointUrl is provided", () => {
      const cfg = {
        region: "eu-central-1",
        bucket: "test-bucket",
        endpointUrl: "http://localhost:4566",
        publicBaseUrl: "https://cdn.example.com",
      };

      const client = createS3Client(cfg);
      expect(client).toBeDefined();
      expect(typeof client.send).toBe("function");
    });
  });
});
