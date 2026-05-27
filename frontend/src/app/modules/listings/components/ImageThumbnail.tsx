import type { ListingImage } from "@app/types/listing";

interface ImageThumbnailProps {
  image: ListingImage;
  index: number;
  isCover: boolean;
  onDelete: (imageId: string) => void;
  onSetAsCover: (imageId: string) => void;
  onDragStart: (imageId: string) => void;
  onDropOn: (imageId: string) => void;
}

export function ImageThumbnail({
  image,
  index,
  isCover,
  onDelete,
  onSetAsCover,
  onDragStart,
  onDropOn,
}: ImageThumbnailProps) {
  return (
    <article
      draggable
      onDragStart={() => onDragStart(image.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDropOn(image.id)}
      className="relative rounded-xl border border-outline-variant overflow-hidden bg-surface"
    >
      <img
        src={image.url}
        alt={`Poza ${index + 1}`}
        className="w-full aspect-square object-cover"
      />

      <div className="absolute top-2 left-2 flex gap-2">
        {isCover ? (
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-primary text-on-primary">
            Copertă
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onSetAsCover(image.id)}
            className="px-2 py-1 text-xs font-semibold rounded-full bg-surface-bright/90 text-on-surface"
          >
            Setează copertă
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(image.id)}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-error text-white flex items-center justify-center"
        aria-label="Șterge poza"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </article>
  );
}
