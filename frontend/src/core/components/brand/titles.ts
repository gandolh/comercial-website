/**
 * The Roman identity's title faces (brief 25). Cinzel is for fixed page titles and section titles only, never for
 * user content (listing titles, names, messages, reviews), labels, buttons, prices or body text.
 */

/** A fixed page title: Cinzel 600, .03em, balanced and never truncated; the page keeps its own size. */
export const PAGE_TITLE = "font-cap font-semibold tracking-[0.03em] text-balance";

/** A section title: Cinzel 600 at 26/32 (21/28 on phones), .04em. */
export const SECTION_TITLE =
  "font-cap text-[26px] leading-8 font-semibold tracking-[0.04em] max-md:text-[21px] max-md:leading-7";

/** The single 1px gold rule under a section head (Home, Listing detail). */
export const SECTION_RULE = "border-b border-gold pb-3";
