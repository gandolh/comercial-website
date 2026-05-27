import { useState } from "react";
import {
  requestAssetUploadUrl,
  putAssetToSignedUrl,
  commitAsset,
  deleteAsset,
} from "../services/assets";
import type { ListingAsset } from "../services/assets";

interface AssetUploadStepProps {
  listingId: string;
  assets: ListingAsset[];
  onAssetsChange: () => void;
  onNext?: () => void;
  onBack?: () => void;
  hideFooter?: boolean;
}

export function AssetUploadStep({
  listingId,
  assets,
  onAssetsChange,
  onNext,
  onBack,
  hideFooter = false,
}: AssetUploadStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleUploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      for (const file of files) {
        // Request upload URL
        const { upload_url, s3_key } = await requestAssetUploadUrl(
          listingId,
          file,
        );

        // Upload file to S3
        await putAssetToSignedUrl(upload_url, file);

        // Commit asset
        await commitAsset(listingId, {
          s3_key,
          original_filename: file.name,
          file_size_bytes: file.size,
          content_type: file.type || "application/octet-stream",
        });
      }

      onAssetsChange();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Eroare la încărcarea fișierelor";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      setIsUploading(true);
      await deleteAsset(listingId, assetId);
      onAssetsChange();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Eroare la ștergerea fișierului";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleUploadFiles(files);
    // Reset input
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    handleUploadFiles(files);
  };

  const hasAssets = assets.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2
          className="text-2xl font-black"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Adaugă fișierele de descărcare
        </h2>
        <p className="text-on-surface-variant">
          Aceasta este cea mai importantă parte - anunțurile cu fișiere clare
          primesc mai multe descărcări.
        </p>
      </div>

      {uploadError && (
        <div className="bg-error/10 border border-error/20 rounded-2xl p-4 text-error text-sm">
          {uploadError}
        </div>
      )}

      <div className="space-y-6">
        {/* Upload area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="bg-surface-container-low border-2 border-dashed border-outline-variant rounded-3xl p-12 text-center space-y-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer group"
        >
          <label htmlFor="file-input" className="cursor-pointer block">
            <span className="material-symbols-outlined text-outline group-hover:text-primary text-5xl mb-4 block transition-colors">
              cloud_upload
            </span>
            <p className="text-on-surface font-semibold mb-1">
              Trage fișierele aici
            </p>
            <p className="text-on-surface-variant text-sm max-w-xs mx-auto">
              sau selectează din calculator
            </p>
            <input
              id="file-input"
              type="file"
              multiple
              onChange={handleFileInputChange}
              disabled={isUploading}
              className="hidden"
              accept="*/*"
            />
          </label>
        </div>

        {/* Assets list */}
        {hasAssets && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-sm">
                Fișierele tale ({assets.length})
              </h3>
            </div>
            <div className="space-y-3">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 flex items-center justify-between group hover:bg-surface-container-high transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="material-symbols-outlined text-primary shrink-0">
                      file_present
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {asset.original_filename}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {formatFileSize(asset.file_size_bytes)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAsset(asset.id)}
                    disabled={isUploading}
                    className="p-2 hover:bg-error/10 text-error rounded-full transition-colors disabled:opacity-50 shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">
                      delete
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasAssets && !isUploading && (
          <div className="bg-surface-container-low border-2 border-dashed border-outline-variant rounded-3xl p-12 text-center space-y-4">
            <span className="material-symbols-outlined text-outline text-5xl">
              download_for_offline
            </span>
            <p className="text-on-surface-variant text-sm max-w-xs mx-auto">
              Încarcă cel puțin un fișier pentru a putea publica anunțul.
            </p>
          </div>
        )}

        {isUploading && (
          <div className="bg-surface-container-low border-2 border-dashed border-primary rounded-3xl p-12 text-center space-y-4">
            <span className="material-symbols-outlined text-primary text-5xl animate-spin">
              progress_activity
            </span>
            <p className="text-on-surface-variant text-sm">
              Se încarcă fișierele...
            </p>
          </div>
        )}
      </div>

      {!hideFooter && (
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isUploading}
            className="flex-1 px-8 py-4 rounded-full font-bold border-2 border-outline-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            Înapoi
          </button>
          <button
            type="button"
            disabled={!hasAssets || isUploading}
            onClick={onNext}
            className={`flex-[2] px-8 py-4 rounded-full font-bold transition-all shadow-md ${
              hasAssets && !isUploading
                ? "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container"
                : "bg-surface-container-highest text-outline cursor-not-allowed shadow-none"
            }`}
          >
            {isUploading ? "Se încarcă..." : "Continuă"}
          </button>
        </div>
      )}
    </div>
  );
}
