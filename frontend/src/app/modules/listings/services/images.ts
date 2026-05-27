import axios from "axios";

import { axiosInstance } from "@core/lib/axios";
import type { ListingImage } from "@app/types/listing";

interface UploadUrlRequest {
  content_type: string;
  filename: string;
}

interface UploadUrlResponse {
  upload_url: string;
  s3_key: string;
  public_url: string;
}

interface CommitImageRequest {
  s3_key: string;
  width?: number;
  height?: number;
  bytes?: number;
}

interface ListingImageApi {
  id: string;
  listing_id: string;
  url: string;
  position: number;
}

export interface PutFileOptions {
  onUploadProgress?: (progress: number) => void;
}

export async function requestUploadUrl(listingId: string, file: File): Promise<UploadUrlResponse> {
  const payload: UploadUrlRequest = {
    content_type: file.type,
    filename: file.name,
  };

  const response = await axiosInstance.post<UploadUrlResponse>(
    `/listings/${listingId}/images/upload-url`,
    payload,
  );

  return response.data;
}

export async function putImageToSignedUrl(
  uploadUrl: string,
  file: File,
  options?: PutFileOptions,
): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: (event) => {
      if (!options?.onUploadProgress || !event.total) {
        return;
      }

      const progress = Math.round((event.loaded * 100) / event.total);
      options.onUploadProgress(progress);
    },
  });
}

export async function commitImage(
  listingId: string,
  data: CommitImageRequest,
): Promise<ListingImage> {
  const response = await axiosInstance.post<ListingImageApi>(`/listings/${listingId}/images`, data);

  return mapImage(response.data);
}

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
