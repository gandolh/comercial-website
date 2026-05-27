import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export interface StorageConfig {
  region: string;
  bucket: string;
  endpointUrl?: string;
  publicBaseUrl: string;
}

export function createS3Client(cfg: StorageConfig): S3Client {
  const clientConfig: any = {
    region: cfg.region,
  };

  if (cfg.endpointUrl) {
    clientConfig.endpoint = cfg.endpointUrl;
    clientConfig.forcePathStyle = true;
    clientConfig.credentials = {
      accessKeyId: "test",
      secretAccessKey: "test",
    };
  }

  return new S3Client(clientConfig);
}

export class StorageService {
  constructor(
    private client: S3Client,
    private cfg: StorageConfig,
  ) {}

  async presignPut(key: string, contentType: string, expiresSeconds = 300): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.cfg.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresSeconds });
  }

  async presignGet(key: string, expiresSeconds = 300): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.cfg.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresSeconds });
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.cfg.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  publicUrl(key: string): string {
    return `${this.cfg.publicBaseUrl}/${key}`;
  }
}

export function listingImageKey(listingId: string, ext: string): string {
  return `listings/${listingId}/${randomUUID()}.${ext}`;
}

export function listingAssetKey(listingId: string, filename: string): string {
  const sanitized = filename.replace(/[^A-Za-z0-9._-]/g, "_");
  return `listings/${listingId}/assets/${randomUUID()}-${sanitized}`;
}
