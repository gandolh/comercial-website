import { axiosInstance } from "@core/lib/axios";
import type { ListingAsset } from "@app/types/listing";

export type { ListingAsset };

interface ListingAssetApi {
  id: string;
  listing_id: string;
  s3_key: string;
  original_filename: string;
  file_size_bytes: number;
  content_type: string;
  position: number;
  created_at: string;
}

export interface UploadAssetOptions {
  onUploadProgress?: (progress: number) => void;
}

// Keep the old PutFileOptions export so any caller that imported it still compiles.
export interface PutFileOptions {
  onUploadProgress?: (progress: number) => void;
}

/**
 * Upload a downloadable asset file for a listing via multipart/form-data (single-step).
 * Backend: POST /listings/:id/assets
 * Response: { id, listing_id, s3_key, original_filename, file_size_bytes, content_type, position, created_at }
 */
export async function uploadAsset(
  listingId: string,
  file: File,
  options?: UploadAssetOptions,
): Promise<ListingAsset> {
  const form = new FormData();
  form.append("file", file, file.name);

  const response = await axiosInstance.post<ListingAssetApi>(
    `/listings/${listingId}/assets`,
    form,
    {
      onUploadProgress: (event) => {
        if (!options?.onUploadProgress || !event.total) return;
        const progress = Math.round((event.loaded * 100) / event.total);
        options.onUploadProgress(progress);
      },
    },
  );

  return mapAsset(response.data);
}

// ---------------------------------------------------------------------------
// Legacy compat shims — keep old names so AssetUploadStep.tsx compiles unchanged.
// The old three-step flow is replaced by a single multipart POST.
// ---------------------------------------------------------------------------

const _pendingAssets = new Map<string, ListingAsset>();

/**
 * @deprecated Use uploadAsset() instead.
 */
export async function requestAssetUploadUrl(
  listingId: string,
  file: File,
  options?: PutFileOptions,
): Promise<{ upload_url: string; s3_key: string; public_url: string }> {
  const asset = await uploadAsset(listingId, file, options);
  const token = `__done__${asset.id}`;
  _pendingAssets.set(token, asset);
  return {
    upload_url: token,
    s3_key: token,
    public_url: asset.publicUrl ?? "",
  };
}

/** No-op: upload already happened in requestAssetUploadUrl. */
export async function putAssetToSignedUrl(
  _uploadUrl: string,
  _file: File,
  _options?: PutFileOptions,
): Promise<void> {
  // Upload was already performed.
}

/** Returns the already-uploaded asset from the stash. */
export async function commitAsset(
  _listingId: string,
  data: {
    s3_key: string;
    original_filename: string;
    file_size_bytes: number;
    content_type: string;
  },
): Promise<ListingAsset> {
  const stashed = _pendingAssets.get(data.s3_key);
  if (stashed) {
    _pendingAssets.delete(data.s3_key);
    return stashed;
  }
  // Fallback: should not happen in normal flow.
  throw new Error("commitAsset: no pending upload found for key " + data.s3_key);
}

// ---------------------------------------------------------------------------

export async function deleteAsset(
  listingId: string,
  assetId: string,
): Promise<void> {
  await axiosInstance.delete(`/listings/${listingId}/assets/${assetId}`);
}

function mapAsset(asset: ListingAssetApi): ListingAsset {
  return {
    id: asset.id,
    originalFilename: asset.original_filename,
    fileSizeBytes: asset.file_size_bytes,
    contentType: asset.content_type,
    position: asset.position,
    s3Key: asset.s3_key,
    publicUrl: undefined,
  };
}
