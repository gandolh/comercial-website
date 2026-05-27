import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ListingImage } from "@app/types/listing";

import {
  commitImage,
  deleteImage,
  putImageToSignedUrl,
  reorderImages,
  requestUploadUrl,
} from "../services/images";

const MAX_CONCURRENT_UPLOADS = 3;

export function useListingImagesMutations(listingId: string) {
  const queryClient = useQueryClient();
  const [progressByFile, setProgressByFile] = useState<Record<string, number>>(
    {},
  );

  const commitMutation = useMutation({
    mutationFn: (payload: {
      s3_key: string;
      width?: number;
      height?: number;
      bytes?: number;
    }) => commitImage(listingId, payload),
    onSuccess: invalidateListing,
  });

  const reorderMutation = useMutation({
    mutationFn: (order: string[]) => reorderImages(listingId, order),
    onSuccess: invalidateListing,
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) => deleteImage(listingId, imageId),
    onSuccess: invalidateListing,
  });

  async function uploadFiles(files: File[]): Promise<ListingImage[]> {
    const queue = [...files];
    const uploaded: ListingImage[] = [];

    const workers = Array.from({
      length: Math.min(MAX_CONCURRENT_UPLOADS, queue.length),
    }).map(async () => {
      while (queue.length > 0) {
        const file = queue.shift();
        if (!file) {
          break;
        }

        const fileKey = `${file.name}-${file.lastModified}`;

        const upload = await requestUploadUrl(listingId, file);
        await putImageToSignedUrl(upload.upload_url, file, {
          onUploadProgress: (progress) => {
            setProgressByFile((prev) => ({ ...prev, [fileKey]: progress }));
          },
        });

        const image = await commitMutation.mutateAsync({
          s3_key: upload.s3_key,
          bytes: file.size,
        });

        uploaded.push(image);
        setProgressByFile((prev) => ({ ...prev, [fileKey]: 100 }));
      }
    });

    await Promise.all(workers);
    return uploaded.sort((a, b) => a.position - b.position);
  }

  function invalidateListing() {
    queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
    queryClient.invalidateQueries({ queryKey: ["listing-related", listingId] });
    queryClient.invalidateQueries({ queryKey: ["favorites"] });
  }

  const isUploading = commitMutation.isPending;

  return useMemo(
    () => ({
      uploadFiles,
      reorderImages: reorderMutation.mutateAsync,
      deleteImage: deleteMutation.mutateAsync,
      isUploading,
      isReordering: reorderMutation.isPending,
      isDeleting: deleteMutation.isPending,
      progressByFile,
    }),
    [
      deleteMutation.isPending,
      deleteMutation.mutateAsync,
      isUploading,
      progressByFile,
      reorderMutation.isPending,
      reorderMutation.mutateAsync,
      uploadFiles,
    ],
  );
}
