import { useState } from "react";
import type { ListingImage } from "@app/types/listing";

interface ListingGalleryProps {
  images: ListingImage[];
  title: string;
  fileFormat?: string;
}

export function ListingGallery({ images, title, fileFormat }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = images[activeIndex]?.url;
  const hasImages = images.length > 0;

  const getFileIcon = (format?: string) => {
    if (!format) return "file_download";
    const lower = format.toLowerCase();
    if (lower === "pdf") return "picture_as_pdf";
    if (lower === "zip") return "folder_zip";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(lower)) return "image";
    if (["doc", "docx"].includes(lower)) return "description";
    if (["xls", "xlsx"].includes(lower)) return "table_chart";
    return "file_download";
  };

  return (
    <section className="group relative">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-container">
        {activeImage ? (
          <img src={activeImage} alt={title} className="h-full w-full object-cover transition-opacity duration-300" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-outline">
            <span className="material-symbols-outlined" style={{ fontSize: "72px" }}>
              {getFileIcon(fileFormat)}
            </span>
            <span className="text-sm font-medium">{fileFormat ? fileFormat.toUpperCase() : "ASSET DIGITAL"}</span>
          </div>
        )}
      </div>

      {hasImages && (
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {images.map((image, i) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(i)}
              className={`h-24 w-24 shrink-0 overflow-hidden rounded-lg transition-opacity ${
                i === activeIndex ? "border-2 border-primary" : "hover:opacity-80"
              }`}
              aria-label={`Imagine ${i + 1}`}
            >
              <img src={image.url} alt={`${title} — imagine ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="absolute top-4 right-4 flex flex-col gap-3">
        <button
          className="rounded-full bg-surface-bright/90 p-3 shadow-lg backdrop-blur-md transition-colors hover:bg-surface-container-lowest"
          aria-label="Distribuie anunțul"
        >
          <span className="material-symbols-outlined text-on-surface-variant">share</span>
        </button>
      </div>
    </section>
  );
}
