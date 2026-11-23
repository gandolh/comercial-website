import { useId } from "react";
import { cn } from "@core/lib/cn";

/**
 * The Greek-key band (brief 22): 12px of meander in a 14px strip. Two places only: under the bar, on the bar's colour
 * with a gold rule over it, and over the footer, in gold on the ground with a gold rule under it. Never inside content.
 * Ornament: hidden from assistive technology, never focusable, no hit area.
 */
export function Frieze({ place, className }: { place: "bar" | "footer"; className?: string }) {
  const pattern = `meander-${useId().replace(/:/g, "")}`;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none block shrink-0",
        place === "bar"
          ? "h-3.5 border-t border-on-nav-band-variant bg-nav-band text-on-nav-band-variant"
          : "h-[13px] border-b border-gold text-gold",
        className,
      )}
    >
      <svg focusable="false" preserveAspectRatio="none" className={cn("block h-3 w-full", place === "bar" && "mt-px")}>
        <defs>
          <pattern id={pattern} width="18" height="12" patternUnits="userSpaceOnUse">
            <path
              d="M0 11.25H18M13.5 11.25V.75H3.75V7.5H10V4H7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </pattern>
        </defs>
        <rect width="100%" height="12" fill={`url(#${pattern})`} />
      </svg>
    </div>
  );
}
