import type { ReactNode } from "react";
import { cn } from "@core/lib/cn";

/** A dovetail handle (ansa) with its ring, 30 × 84 (19 × 54 under 768px); the right one is mirrored. */
function Ansa({ side }: { side: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 30 84"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "pointer-events-none absolute top-1/2 h-21 w-7.5 -translate-y-1/2 text-gold max-[599px]:hidden max-md:h-13.5 max-md:w-[19px]",
        side === "left" ? "-left-7.5 max-md:-left-[19px]" : "-right-7.5 -scale-x-100 max-md:-right-[19px]",
      )}
    >
      <path
        d="M30 29L1.5 4v76L30 55"
        className="fill-surface-container-lowest"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="11" cy="42" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * The inscription tablet, a tabula ansata (brief 23), Home's hero only: marble with a double gold rule (1px, a 5px
 * marble gap, 1px; 4px on phones) and a dovetail handle on each side, which phones under 600px drop. The frame and
 * the handles are ornament (aria-hidden); the children are the hero's content.
 */
export function Tabula({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative border border-gold bg-surface-container-lowest shadow-card max-md:shadow-band dark:shadow-none",
        className,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-[5px] border border-gold max-md:inset-1" />
      <Ansa side="left" />
      <Ansa side="right" />
      <div className="relative">{children}</div>
    </div>
  );
}
