import { useState } from "react";
import { cn } from "@core/lib/cn";
import type { ListingImage } from "@app/types/listing";
import { Panel } from "./Panel";
import { PreviewImage } from "./PreviewImage";

interface ListingGalleryProps {
  images: ListingImage[];
  title: string;
  category?: string;
  className?: string;
}

export function ListingGallery({ images, title, category, className }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = images[activeIndex]?.url;
  const hasImages = images.length > 0;

  return (
    <Panel aria-label="Galerie" className={cn("gap-0 p-3 md:p-3", className)}>
      <div className="relative aspect-16/10 overflow-hidden rounded-lg">
        <PreviewImage src={activeImage} alt={title} category={category} showLabel iconSize={56} />
        <button
          type="button"
          className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-surface-container-lowest text-on-surface shadow-card transition-colors hover:bg-surface-container-low"
          aria-label="Distribuie anunțul"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            share
          </span>
        </button>
      </div>

      {hasImages && (
        <div className="flex gap-2 overflow-x-auto pt-3">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-pressed={i === activeIndex}
              className={cn(
                "h-16 w-22 shrink-0 overflow-hidden rounded-lg transition-opacity",
                i === activeIndex ? "ring-2 ring-primary ring-inset" : "hover:opacity-80",
              )}
              aria-label={`Imagine ${i + 1}`}
            >
              <PreviewImage src={image.url} alt={`${title} — imagine ${i + 1}`} category={category} iconSize={24} />
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}
