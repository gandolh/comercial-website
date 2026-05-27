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
    <section className="relative group">
      <div className="aspect-[4/3] w-full bg-surface-container overflow-hidden rounded-xl">
        {activeImage ? (
          <img
            src={activeImage}
            alt={title}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-outline gap-4">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "72px" }}
            >
              {getFileIcon(fileFormat)}
            </span>
            <span className="text-sm font-medium">
              {fileFormat ? fileFormat.toUpperCase() : "ASSET DIGITAL"}
            </span>
          </div>
        )}
      </div>

      {hasImages && (
        <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
          {images.map((image, i) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(i)}
              className={`w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden transition-opacity ${
                i === activeIndex ? "border-2 border-primary" : "hover:opacity-80"
              }`}
              aria-label={`Imagine ${i + 1}`}
            >
              <img
                src={image.url}
                alt={`${title} — imagine ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="absolute top-4 right-4 flex flex-col gap-3">
        <button
          className="bg-surface-bright/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white transition-colors"
          aria-label="Distribuie anunțul"
        >
          <span className="material-symbols-outlined text-on-surface-variant">
            share
          </span>
        </button>
      </div>
    </section>
  );
}
