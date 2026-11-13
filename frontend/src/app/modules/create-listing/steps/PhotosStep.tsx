import { ImageUploader } from "../../listings/components/ImageUploader";
import { ImageGalleryEditor } from "../../listings/components/ImageGalleryEditor";
import { useListingImagesMutations } from "../../listings/hooks/useListingImages";
import type { ListingImage } from "@app/types/listing";

interface PhotosStepProps {
  listingId: string;
  images: ListingImage[];
  onImagesChange: () => void;
  onNext?: () => void;
  onBack?: () => void;
  hideFooter?: boolean;
}

export function PhotosStep({ listingId, images, onImagesChange, onNext, onBack, hideFooter = false }: PhotosStepProps) {
  const { uploadFiles, isUploading } = useListingImagesMutations(listingId);
  const hasImages = images.length > 0;

  const handleUpload = async (files: File[]) => {
    await uploadFiles(files);
    onImagesChange();
  };

  return (
    <div className="space-y-8 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="font-headline text-2xl font-extrabold">Imagini de previzualizare</h2>
        <p className="text-on-surface-variant">Adaugă poze cu produsul tău pentru o prezentare mai bună (opțional).</p>
      </div>

      <div className="space-y-6">
        <ImageUploader existingCount={images.length} onUploadFiles={handleUpload} />

        {hasImages && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold">Fotografiile tale ({images.length}/10)</h3>
              {images.length < 3 && (
                <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-medium text-on-secondary-container">
                  Recomandăm minim 3 poze
                </span>
              )}
            </div>
            <ImageGalleryEditor listingId={listingId} images={images} onImagesChange={onImagesChange} />
          </div>
        )}

        {!hasImages && !isUploading && (
          <div className="space-y-4 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">add_a_photo</span>
            <p className="mx-auto max-w-xs text-sm text-on-surface-variant">
              Adaugă imagini opționale pentru a face anunțul mai atractiv.
            </p>
          </div>
        )}
      </div>

      {!hideFooter && (
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-control border border-outline px-5 py-3 font-semibold transition-colors hover:bg-surface-container-low"
          >
            Înapoi
          </button>
          <button
            type="button"
            disabled={isUploading}
            onClick={onNext}
            className="flex-[2] rounded-control bg-primary px-8 py-4 font-bold text-on-primary transition-all hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
          >
            {isUploading ? "Se încarcă..." : "Continuă"}
          </button>
        </div>
      )}
    </div>
  );
}
