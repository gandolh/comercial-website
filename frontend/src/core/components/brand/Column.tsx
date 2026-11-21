import { cn } from "@core/lib/cn";

/**
 * A line-drawn fluted column (brief 23), Home's hero only: it stands at the band's edges from 1000px, scaled to the
 * hero's height. Drawn from the Roman rebrand comps. Ornament: hidden, unfocusable, no hit area.
 */
export function Column({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 248"
      preserveAspectRatio="xMidYMax meet"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none", className)}
    >
      <path d="M2 4h68v9H2z" />
      <path d="M8 13h56l-7 11H15z" />
      <path d="M15 24h42M17 30h38" />
      <path d="M18 30l-2 192h40l-2-192" />
      <path d="M24 36v180M30 36v180M36 36v180M42 36v180M48 36v180" strokeWidth="1" />
      <path d="M12 222h48v9H12zM5 231h62v13H5z" />
    </svg>
  );
}
