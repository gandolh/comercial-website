import { axiosInstance } from "@core/lib/axios";
import type { ListingImage } from "@app/types/listing";

interface ListingImageApi {
  id: string;
  listing_id: string;
  url: string;
  position: number;
}

export interface UploadImageOptions {
  onUploadProgress?: (progress: number) => void;
}

// Keep the old PutFileOptions export so any caller that imported it still compiles.
export interface PutFileOptions {
  onUploadProgress?: (progress: number) => void;
}

/**
 * Upload an image for a listing via multipart/form-data (single-step).
 * Backend: POST /listings/:id/images
 * Response: { id, listing_id, url, position }
 */
export async function uploadImage(
  listingId: string,
  file: File,
  options?: UploadImageOptions,
): Promise<ListingImage> {
  const form = new FormData();
  form.append("file", file, file.name);

  const response = await axiosInstance.post<ListingImageApi>(
    `/listings/${listingId}/images`,
    form,
    {
      onUploadProgress: (event) => {
        if (!options?.onUploadProgress || !event.total) return;
        const progress = Math.round((event.loaded * 100) / event.total);
        options.onUploadProgress(progress);
      },
    },
  );

  return mapImage(response.data);
}

// ---------------------------------------------------------------------------
// Legacy compat shims — keep old names so existing hooks compile unchanged.
// The old two-step flow (requestUploadUrl → putImageToSignedUrl → commitImage)
// is replaced by a single multipart POST.  We expose placeholder helpers that
// make the three-call sequence a no-op except for the actual upload, which
// happens inside requestUploadUrl (the first call).
// ---------------------------------------------------------------------------

/**
 * @deprecated Use uploadImage() instead.
 * Kept for backward compatibility with useListingImages hook.
 * Performs the full upload in one step and stashes the resulting image on a
 * per-request token so that the subsequent putImageToSignedUrl/commitImage
 * calls are no-ops that still return the correct data.
 */
const _pendingUploads = new Map<string, ListingImage>();

export async function requestUploadUrl(
  listingId: string,
  file: File,
  options?: PutFileOptions,
): Promise<{ upload_url: string; s3_key: string; public_url: string }> {
  const image = await uploadImage(listingId, file, options);
  // Stash under a synthetic "key" so commitImage can return it.
  const token = `__done__${image.id}`;
  _pendingUploads.set(token, image);
  return { upload_url: token, s3_key: token, public_url: image.url };
}

/** No-op: upload already happened in requestUploadUrl. */
export async function putImageToSignedUrl(
  _uploadUrl: string,
  _file: File,
  _options?: PutFileOptions,
): Promise<void> {
  // Upload was already performed.  Nothing to do.
}

/** Returns the already-uploaded image from the stash. */
export async function commitImage(
  _listingId: string,
  data: { s3_key: string; width?: number; height?: number; bytes?: number },
): Promise<ListingImage> {
  const stashed = _pendingUploads.get(data.s3_key);
  if (stashed) {
    _pendingUploads.delete(data.s3_key);
    return stashed;
  }
  // Fallback: should not happen in normal flow.
  throw new Error("commitImage: no pending upload found for key " + data.s3_key);
}

// ---------------------------------------------------------------------------

export async function reorderImages(listingId: string, order: string[]): Promise<ListingImage[]> {
  const response = await axiosInstance.patch<ListingImageApi[]>(`/listings/${listingId}/images/reorder`, {
    order,
  });
  return response.data.map(mapImage);
}

export async function deleteImage(listingId: string, imageId: string): Promise<void> {
  await axiosInstance.delete(`/listings/${listingId}/images/${imageId}`);
}

function mapImage(image: ListingImageApi): ListingImage {
  return {
    id: image.id,
    url: image.url,
    position: image.position,
  };
}
