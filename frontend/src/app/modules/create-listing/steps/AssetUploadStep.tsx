import { useState } from "react";
import { requestAssetUploadUrl, putAssetToSignedUrl, commitAsset, deleteAsset } from "../services/assets";
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
        const { upload_url, s3_key } = await requestAssetUploadUrl(listingId, file);

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
      const message = error instanceof Error ? error.message : "Eroare la încărcarea fișierelor";
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
      const message = error instanceof Error ? error.message : "Eroare la ștergerea fișierului";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    void handleUploadFiles(files);
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
    void handleUploadFiles(files);
  };

  const hasAssets = assets.length > 0;

  return (
    <div className="space-y-8 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="font-headline text-2xl font-extrabold">Adaugă fișierele de descărcare</h2>
        <p className="text-on-surface-variant">
          Aceasta este cea mai importantă parte - anunțurile cu fișiere clare primesc mai multe descărcări.
        </p>
      </div>

      {uploadError && (
        <div className="rounded-2xl border border-error/20 bg-error/10 p-4 text-sm text-error">{uploadError}</div>
      )}

      <div className="space-y-6">
        {/* Upload area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="group cursor-pointer space-y-4 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low p-12 text-center transition-colors hover:border-primary hover:bg-primary/5"
        >
          <label htmlFor="file-input" className="block cursor-pointer">
            <span className="material-symbols-outlined mb-4 block text-5xl text-on-surface-variant transition-colors group-hover:text-primary">
              cloud_upload
            </span>
            <p className="mb-1 font-semibold text-on-surface">Trage fișierele aici</p>
            <p className="mx-auto max-w-xs text-sm text-on-surface-variant">sau selectează din calculator</p>
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
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold">Fișierele tale ({assets.length})</h3>
            </div>
            <div className="space-y-3">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="group flex items-center justify-between rounded-2xl border border-outline-variant bg-surface-container-low p-4 transition-colors hover:bg-surface-container-high"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className="material-symbols-outlined shrink-0 text-primary">file_present</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{asset.originalFilename}</p>
                      <p className="text-xs text-on-surface-variant">{formatFileSize(asset.fileSizeBytes)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteAsset(asset.id)}
                    disabled={isUploading}
                    className="shrink-0 rounded-full p-2 text-error transition-colors hover:bg-error/10 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasAssets && !isUploading && (
          <div className="space-y-4 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">download_for_offline</span>
            <p className="mx-auto max-w-xs text-sm text-on-surface-variant">
              Încarcă cel puțin un fișier pentru a putea publica anunțul.
            </p>
          </div>
        )}

        {isUploading && (
          <div className="space-y-4 rounded-2xl border-2 border-dashed border-primary bg-surface-container-low p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-primary motion-safe:animate-spin">
              progress_activity
            </span>
            <p className="text-sm text-on-surface-variant">Se încarcă fișierele...</p>
          </div>
        )}
      </div>

      {!hideFooter && (
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isUploading}
            className="flex-1 rounded-control border border-outline px-5 py-3 font-semibold transition-colors hover:bg-surface-container-low disabled:opacity-50"
          >
            Înapoi
          </button>
          <button
            type="button"
            disabled={!hasAssets || isUploading}
            onClick={onNext}
            className={`flex-[2] rounded-full px-8 py-4 font-bold shadow-md transition-all ${
              hasAssets && !isUploading
                ? "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container"
                : "cursor-not-allowed bg-surface-container-highest text-on-surface-variant shadow-none"
            }`}
          >
            {isUploading ? "Se încarcă..." : "Continuă"}
          </button>
        </div>
      )}
    </div>
  );
}
