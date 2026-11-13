import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@core/lib/cn";

/** The icon a category's missing preview shows (Material Symbols names). */
const CATEGORY_ICONS: Record<string, string> = {
  grafica: "palette",
  sabloane: "dashboard_customize",
  software: "apps",
  "cod-sursa": "terminal",
  audio: "music_note",
  video: "movie",
  ebook: "menu_book",
  fonturi: "font_download",
  documente: "description",
  "3d": "view_in_ar",
  mestesugart: "brush",
  invitatii: "celebration",
  diverse: "category",
};

interface PreviewImageProps {
  src: string | null | undefined;
  alt: string;
  category?: string;
  /** The tile also says "Fără previzualizare" in words (the detail page's large tile). */
  showLabel?: boolean;
  iconSize?: number;
  className?: string;
  imgClassName?: string;
}

/**
 * A listing's picture, or the "Fără previzualizare" tile when there is none or the file does not load, so a
 * broken image never spills its alt text over the media area.
 */
export function PreviewImage({
  src,
  alt,
  category,
  showLabel = false,
  iconSize = 40,
  className,
  imgClassName,
}: PreviewImageProps) {
  const { t } = useTranslation();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (src && failedSrc !== src) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setFailedSrc(src)}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3 bg-surface-container-low text-on-surface-variant",
        className,
      )}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: `${iconSize}px` }}
        role={showLabel ? undefined : "img"}
        aria-label={showLabel ? undefined : t("listing.noPreview")}
        aria-hidden={showLabel ? true : undefined}
      >
        {(category && CATEGORY_ICONS[category]) || "image"}
      </span>
      {showLabel && <span className="text-control">{t("listing.noPreview")}</span>}
    </div>
  );
}
