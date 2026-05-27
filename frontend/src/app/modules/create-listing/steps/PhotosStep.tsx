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

export function PhotosStep({
  listingId,
  images,
  onImagesChange,
  onNext,
  onBack,
  hideFooter = false,
}: PhotosStepProps) {
  const { uploadFiles, isUploading } = useListingImagesMutations(listingId);
  const hasImages = images.length > 0;

  const handleUpload = async (files: File[]) => {
    await uploadFiles(files);
    onImagesChange();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2
          className="text-2xl font-black"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Imagini de previzualizare
        </h2>
        <p className="text-on-surface-variant">
          Adaugă poze cu produsul tău pentru o prezentare mai bună (opțional).
        </p>
      </div>

      <div className="space-y-6">
        <ImageUploader
          existingCount={images.length}
          onUploadFiles={handleUpload}
        />

        {hasImages && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-sm">
                Fotografiile tale ({images.length}/10)
              </h3>
              {images.length < 3 && (
                <span className="text-xs bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-medium">
                  Recomandăm minim 3 poze
                </span>
              )}
            </div>
            <ImageGalleryEditor
              listingId={listingId}
              images={images}
              onImagesChange={onImagesChange}
            />
          </div>
        )}

        {!hasImages && !isUploading && (
          <div className="bg-surface-container-low border-2 border-dashed border-outline-variant rounded-3xl p-12 text-center space-y-4">
            <span className="material-symbols-outlined text-outline text-5xl">
              add_a_photo
            </span>
            <p className="text-on-surface-variant text-sm max-w-xs mx-auto">
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
            className="flex-1 px-8 py-4 rounded-full font-bold border-2 border-outline-variant hover:bg-surface-container-low transition-colors"
          >
            Înapoi
          </button>
          <button
            type="button"
            disabled={isUploading}
            onClick={onNext}
            className="flex-[2] px-8 py-4 rounded-full font-bold bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md disabled:opacity-50"
          >
            {isUploading ? "Se încarcă..." : "Continuă"}
          </button>
        </div>
      )}
    </div>
  );
}
