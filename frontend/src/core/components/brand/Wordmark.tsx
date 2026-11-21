import { Link } from "@core/lib/router";
import { cn } from "@core/lib/cn";
import { BRAND } from "./brand";
import { Laurel } from "./Laurel";

/**
 * The wordmark (brief 22): the laurel, then the name in Cinzel 700 capitals spaced .12em; gold on the bar, ink with a
 * gold laurel elsewhere. Phones get 18px at .07em with a 20px laurel; on the bar under 380px the laurel hides so the
 * signed-in bar fits at 360px. Its accessible name is the product name in normal case.
 */
export function Wordmark({ tone, className }: { tone: "bar" | "ink"; className?: string }) {
  return (
    <Link
      to="/"
      aria-label={`${BRAND.name}, acasă`}
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 rounded-control font-cap text-[26px] leading-7 font-bold tracking-[0.12em] whitespace-nowrap no-underline",
        "max-md:gap-1.5 max-md:text-lg max-md:tracking-[0.07em]",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        tone === "bar"
          ? "text-on-nav-band-variant focus-visible:outline-on-nav-band-variant"
          : "text-on-surface focus-visible:outline-primary",
        className,
      )}
    >
      <Laurel className={cn("shrink-0 max-md:size-5", tone === "bar" ? "max-[379px]:hidden" : "text-gold")} />
      {BRAND.lettering}
    </Link>
  );
}
