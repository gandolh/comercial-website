import axios from "axios";

import { axiosInstance } from "@/lib/axios";

interface UploadUrlRequest {
  content_type: string;
  filename: string;
}

interface UploadUrlResponse {
  upload_url: string;
  s3_key: string;
  public_url: string;
}

interface CommitAssetRequest {
  s3_key: string;
  original_filename: string;
  file_size_bytes: number;
  content_type: string;
}

export interface ListingAsset {
  id: string;
  s3_key: string;
  original_filename: string;
  file_size_bytes: number;
  content_type: string;
  public_url: string;
}

interface ListingAssetApi {
  id: string;
  listing_id: string;
  s3_key: string;
  original_filename: string;
  file_size_bytes: number;
  content_type: string;
  public_url: string;
}

export interface PutFileOptions {
  onUploadProgress?: (progress: number) => void;
}

export async function requestAssetUploadUrl(
  listingId: string,
  file: File,
): Promise<UploadUrlResponse> {
  const payload: UploadUrlRequest = {
    content_type: file.type,
    filename: file.name,
  };

  const response = await axiosInstance.post<UploadUrlResponse>(
    `/listings/${listingId}/assets/upload-url`,
    payload,
  );

  return response.data;
}

export async function putAssetToSignedUrl(
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

export async function commitAsset(
  listingId: string,
  data: CommitAssetRequest,
): Promise<ListingAsset> {
  const response = await axiosInstance.post<ListingAssetApi>(
    `/listings/${listingId}/assets`,
    data,
  );

  return mapAsset(response.data);
}

export async function deleteAsset(
  listingId: string,
  assetId: string,
): Promise<void> {
  await axiosInstance.delete(`/listings/${listingId}/assets/${assetId}`);
}

function mapAsset(asset: ListingAssetApi): ListingAsset {
  return {
    id: asset.id,
    s3_key: asset.s3_key,
    original_filename: asset.original_filename,
    file_size_bytes: asset.file_size_bytes,
    content_type: asset.content_type,
    public_url: asset.public_url,
  };
}
