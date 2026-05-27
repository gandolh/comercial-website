import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { ListingImage } from "@app/types/listing";

import { useListingImagesMutations } from "../hooks/useListingImages";
import { ImageThumbnail } from "./ImageThumbnail";
import { ImageUploader } from "./ImageUploader";

interface ImageGalleryEditorProps {
  listingId: string;
  images: ListingImage[];
  onImagesChange?: (images: ListingImage[]) => void;
}

export function ImageGalleryEditor({ listingId, images, onImagesChange }: ImageGalleryEditorProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState<ListingImage[]>(images);
  const mutations = useListingImagesMutations(listingId);

  const sortedImages = useMemo(
    () => [...localImages].sort((a, b) => a.position - b.position),
    [localImages],
  );

  async function handleUpload(files: File[]) {
    try {
      const created = await mutations.uploadFiles(files);
      const next = [...sortedImages, ...created].sort((a, b) => a.position - b.position);
      setLocalImages(next);
      onImagesChange?.(next);
    } catch {
      toast.error("Nu am putut încărca pozele. Încearcă din nou.");
    }
  }

  async function handleDelete(imageId: string) {
    try {
      await mutations.deleteImage(imageId);
      const next = sortedImages
        .filter((image) => image.id !== imageId)
        .map((image, index) => ({ ...image, position: index }));
      setLocalImages(next);
      onImagesChange?.(next);
    } catch {
      toast.error("Nu am putut șterge poza.");
    }
  }

  async function handleReorder(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      return;
    }

    const fromIndex = sortedImages.findIndex((image) => image.id === draggingId);
    const toIndex = sortedImages.findIndex((image) => image.id === targetId);

    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const reordered = [...sortedImages];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const normalized = reordered.map((image, index) => ({ ...image, position: index }));
    setLocalImages(normalized);
    setDraggingId(null);

    try {
      await mutations.reorderImages(normalized.map((image) => image.id));
      onImagesChange?.(normalized);
    } catch {
      toast.error("Nu am putut salva ordinea pozelor.");
    }
  }

  async function setAsCover(imageId: string) {
    const without = sortedImages.filter((image) => image.id !== imageId);
    const cover = sortedImages.find((image) => image.id === imageId);
    if (!cover) {
      return;
    }

    const normalized = [cover, ...without].map((image, index) => ({ ...image, position: index }));
    setLocalImages(normalized);

    try {
      await mutations.reorderImages(normalized.map((image) => image.id));
      onImagesChange?.(normalized);
    } catch {
      toast.error("Nu am putut seta poza de copertă.");
    }
  }

  return (
    <section className="space-y-6">
      <ImageUploader existingCount={sortedImages.length} onUploadFiles={handleUpload} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {sortedImages.map((image, index) => (
          <ImageThumbnail
            key={image.id}
            image={image}
            index={index}
            isCover={index === 0}
            onDelete={handleDelete}
            onSetAsCover={setAsCover}
            onDragStart={setDraggingId}
            onDropOn={handleReorder}
          />
        ))}
      </div>
    </section>
  );
}
