import { randomUUID } from "crypto";
import { mkdir, unlink } from "node:fs/promises";
import { createWriteStream, existsSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export interface StorageConfig {
  uploadsDir: string;   // absolute path to uploads directory on disk
  publicBaseUrl: string; // e.g. http://localhost:8080/uploads
}

export class StorageService {
  constructor(private cfg: StorageConfig) {}

  /** Ensure the uploads directory tree exists for a given key. */
  private async ensureDir(key: string): Promise<void> {
    const dir = path.dirname(path.join(this.cfg.uploadsDir, key));
    await mkdir(dir, { recursive: true });
  }

  /** Absolute path on disk for a given storage key. */
  absolutePath(key: string): string {
    return path.join(this.cfg.uploadsDir, key);
  }

  /** Public HTTP URL for a stored file. */
  publicUrl(key: string): string {
    const base = this.cfg.publicBaseUrl.replace(/\/$/, "");
    return `${base}/${key}`;
  }

  /** Write a Buffer or Readable stream to disk under `key`. */
  async putObject(key: string, data: Buffer | Readable): Promise<void> {
    await this.ensureDir(key);
    const dest = this.absolutePath(key);
    if (data instanceof Buffer) {
      const { writeFile } = await import("node:fs/promises");
      await writeFile(dest, data);
    } else {
      await pipeline(data, createWriteStream(dest));
    }
  }

  /** Delete a file from disk. Does not throw if the file is missing. */
  async deleteObject(key: string): Promise<void> {
    const filePath = this.absolutePath(key);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  }
}

export function listingImageKey(listingId: string, ext: string): string {
  return `listings/${listingId}/${randomUUID()}.${ext}`;
}

export function listingAssetKey(listingId: string, filename: string): string {
  const sanitized = filename.replace(/[^A-Za-z0-9._-]/g, "_");
  return `listings/${listingId}/assets/${randomUUID()}-${sanitized}`;
}
