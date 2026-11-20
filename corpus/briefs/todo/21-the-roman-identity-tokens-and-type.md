# Task 21: The Roman identity, tokens and type

**Depends on:**

- In comercial-website: [brief 14](../done/14-a-redesign-with-hallmark-on-the-estate-board.md), which shipped "The filter band" with the Material 3 role names, the Light / Dark / System switch, `contrast.test.ts` and the Playwright specs in `frontend/e2e/`. This brief changes values on top of it, not names.
- The estate redesign board, PiațăRo page, row "Alternative: a Roman rebrand" (board version 38, 2026-11-20). The owner liked the first sketch on 2026-11-20 and asked for it to be refined and briefed; the refined row (Home, Category, Listing detail, the identity card) waits for the owner's approval.

**Runs before:** 22, 23, 24, 25 (each restyles screens on these tokens). 26 is independent. **Runs after:** 14.

## Context

The owner asked for an alternative look for PiațăRo "in the style of the Roman empire". The sketch keeps the
layout, the places, the Romanian copy and the information structure of The filter band, and changes only the
identity:

- **Type:** Cinzel (Roman inscriptional capitals) for the wordmark, fixed page titles and section titles only;
  Alegreya Sans (a humanist sans) for everything else, listing titles included, because they are user content.
- **Colour:** a porphyry purple-black shell (top bar, sell band, the verified chip); vexillum red for actions;
  gold for lines and ornament only; bronze, gold's text-safe shade, for prices and category icons; travertine and
  marble neutrals. Dark keeps the porphyry bar over a basalt ground.
- **Shape:** stone-cut radii (6 px cards and controls, 4 px segments), shadows tinted with porphyry.

The comps are rendered HTML in [design/roman-rebrand/](../../../design/roman-rebrand/): `home-*.html`,
`category-*.html` and `detail-*.html` in light and dark, plus `identity.html`, the brand card. Every comp carries
the full `.theme-light` and `.theme-dark` role blocks, and they are the same in every file.

## Decisions

Decided 2026-11-20 on the board, after two design-critic rounds against the approved screens:

- **Role names stay.** The values come from the comps' `.theme-light` and `.theme-dark` blocks, mapped onto the
  role names in `frontend/src/index.css`. Two additions:
  - `--color-action-fill` is the filled action's background: `#9a2617` light, `#c24a36` dark, white on it in
    dark (4.85:1). Dark `--color-primary` stays the light salmon `#f0937c` for links, text and outlines.
  - `--color-gold` (`#b8892e` light, `#b8964d` dark) is for lines and ornament only. `--color-gold-ink`
    (`#6f5216` light, `#dcbb6c` dark) is the gold for prices and small words. `--color-niche` is the category
    niche's fill.
- **What red does:**
  - one filled action per screen;
  - the selected state, as an outline and a tint;
  - links and the current place;
  - a control in use, such as the slider or an active heart.

  Nothing else is red.
- **The tonal button is a porphyry tint.** It uses `#ece2e8` with `#2d1026` in light and `#3d2735` with `#f3e3ec`
  in dark, never gold.
- **Figures.** Alegreya Sans defaults to old-style figures, so the root sets `font-variant-numeric: lining-nums`.
  Prices, counts, IDs and stats add `tabular-nums`, and every rule that sets numeric variants keeps `lining-nums`
  in it.
- **Sizes.** Alegreya Sans has a small x-height, so text in it gets `font-size-adjust: 0.5`. Text in Cinzel gets
  `font-size-adjust: none`. The type scale's sizes from brief 14 stay as they are.
- **Cinzel's own token.** Cinzel gets a new `--font-cap` token. `--font-headline`, `--font-body` and
  `--font-label` all become Alegreya Sans, because `--font-headline` is used in 54 places, listing titles
  among them. Briefs 22 to 25 put `--font-cap` on the wordmark, the fixed page titles and the section titles.
- **Self-hosted fonts.** The faces come from `@fontsource/cinzel` and `@fontsource/alegreya-sans`, pinned
  exactly; 5.3.0 is the current version of both on 2026-11-20. Take Cinzel 600 and 700, and Alegreya Sans 400,
  500, 700 and 800, with the latin-ext subset for ș and ț. `@fontsource-variable/schibsted-grotesk` goes. The
  Material Symbols link stays.

## Files you OWN

- `frontend/src/index.css` (both theme blocks, fonts, radii, shadows, the root's numeric and size settings), `frontend/package.json` and its lockfile.
- `frontend/src/core/lib/theme` (`THEME_COLORS`) and the `theme-color` metas in `frontend/index.html`.
- The UI primitives in `frontend/src/core/components/ui/`, for what the tokens alone don't carry:
  - Button: `pri` on `--color-action-fill`, `tonal` on the porphyry tint.
  - Badge, for the verified chip: porphyry with a gold check and a 1 px gold inset ring. This is the Verificat
    badge on cards and Vânzător verificat on the seller card.
  - Chip and segment selected states.
  - Card radius.
- `frontend/src/contrast.test.ts`, and `frontend/src/index.css.test.ts` if a token name it reads moves.
- `design/README.md` (a line on `roman-rebrand/`); corpus: a new `wiki/roman-identity.md` recorded from the shipped
  tokens; [wiki/decisions.md](../../wiki/decisions.md) (the reopened identity); [wiki/carpathian-clear.md](../../wiki/carpathian-clear.md)
  (a line saying it is now history); [wiki/status.md](../../wiki/status.md); [log.md](../../log.md).

## Files you must NOT touch

- `backend/`, `infrastructure/`, `seed-data/`.
- Page and layout components (briefs 22 to 25), behaviour, and copy. The product name stays PiațăRo here (brief 26).

## What to do

1. Record the owner's approval of the board row in `log.md` with its date. If the owner hasn't approved the
   refined row yet, stop and ask.
2. Fonts: add the two packages, drop Schibsted Grotesk, import the weights above in `index.css`, set `--font-cap`
   and the three Alegreya Sans font tokens, the root's `lining-nums` and `font-size-adjust`.
3. Tokens: map both comp blocks onto the role names, and add `--color-action-fill`, `--color-gold`,
   `--color-gold-ink` and `--color-niche`. Set radii to 6 px (cards, controls) and 4 px (segments) and the
   porphyry-tinted shadows. `THEME_COLORS` and `index.html` take the new backgrounds.
4. Primitives: Button, Badge, Chip, segments and Card as listed under Files you own.
5. Contrast: extend `contrast.test.ts` with the new pairs:
   - white on `action-fill` in both themes;
   - the tonal pair;
   - `gold-ink` on the ground, the surfaces and `niche`;
   - the verified chip's text on porphyry;
   - `on-nav-band` and `on-nav-band-variant` on `nav-band`.

   Then run the whole table.
6. Screens are not restyled here, but they must not break: run the Playwright specs as brief 14 left them.

## Acceptance

- [ ] The owner's approval is in `log.md` with its date.
- [ ] `contrast.test.ts` passes over both themes. Every text pair is 4.5:1 or more, large text and UI parts
      3:1 or more. The outcome note lists the minimums.
- [ ] Each face loads once, self-hosted. ă â î ș ț render in Cinzel and in Alegreya Sans, with no fallback
      glyphs: a Playwright check on a page that has all five.
- [ ] A price, a count and an ID render with lining figures. Check `getComputedStyle(...).fontVariantNumeric`
      on one of each.
- [ ] `--font-headline` is not Cinzel; listing titles stay in Alegreya Sans.
- [ ] Brief 14's specs still pass: focus ring, reduced motion, 390 overflow, the theme switch, the filters, the
      overlays. `npm run check` passes and `bash corpus/lint.sh` ends clean.

## Interplay

- Briefs 22 to 25 restyle the shell and the screens on these tokens, one per brief. Until they land, the screens
  show the new colours and faces on brief 14's layout. Ship 21 to 25 together if the owner wants no mixed state
  live.
- The owner reruns `npm ci` in `frontend/`, because the font packages change.
