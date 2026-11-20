# Task 25: Listing detail and the undrawn screens in the Roman identity

**Depends on:** [brief 21](21-the-roman-identity-tokens-and-type.md) and [brief 22](22-the-roman-shell.md).
Run it after 23 and 24, because this brief writes the design documents from what shipped.

**Runs before:** nothing. **Runs after:** 23, 24.

## Context

The comps are [design/roman-rebrand/detail-light.html](../../../design/roman-rebrand/detail-light.html) and
`detail-dark.html`, and [identity.html](../../../design/roman-rebrand/identity.html), the brand card. The detail
page is `listings/pages/ListingDetailPage.tsx`, with `PricingCard`, `SellerCard` and the gallery. Brief 14's
table of screens lists the rest. Only Home, Category and Listing detail were drawn; every other screen follows
the rules below.

What changes on Listing detail:

- **The listing title stays in Alegreya Sans 800.** It is user content. The section titles (Descriere,
  Recenzii, and the like) are Cinzel 600 with a 1 px gold rule under them.
- **The price** is bronze, 800, with lining tabular figures and a smaller RON.
- **The actions.** Descarcă Asset is the one red fill. Contactează Autorul is the tonal porphyry tint. The
  seller card's Contactează autorul is outlined.
- **Vânzător verificat** is brief 21's chip: porphyry with a gold check.
- **The ID** uses tabular lining figures at 12 px or more, and wraps as brief 14 made it.

## Decisions: the rules for every undrawn screen

Decided on the board, 2026-11-20. Each rule below is a copy of a decision from briefs 21 to 23:

- **Cinzel** is for fixed page titles and section titles only, never for user content, labels, buttons, prices
  or body text.
- **One filled red action per screen.** Red also marks selected states (outline and tint), links, the current
  place, and a control in use. Nothing else is red.
- **Gold** is for lines and ornament; text in gold uses bronze (`gold-ink`).
- **No new ornament.** The frieze stays under the bar and over the footer. The columns, the tablet and the
  wreath are Home's only.
- **Lining figures everywhere,** and tabular where numbers line up: tables, prices, invoices, the payout ledger.
- **Cards and panels** keep brief 14's grouping, with the radius and shadow from brief 21.

## Files you OWN

- `frontend/src/app/modules/listings/` and every page in brief 14's table, for the rules above only.
- The design documents:
  - `design/README.md`;
  - a new `design/design-system/roman-identity.json` with the light values, in the shape of
    `carpathian-clear.json`, which stays as history;
  - the root `CLAUDE.md`, the "Design system" section;
  - `README.md`, where it names the faces or colours. Brief 14 left both of these stale.
- Corpus: `wiki/roman-identity.md` (brief 21 creates it; this brief finishes it from what shipped),
  [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- `backend/`, `infrastructure/`, `seed-data/`.
- Behaviour, queries, forms, the wizard's steps, checkout and messaging. Copy keeps its meaning and diacritics.

## What to do

1. Listing detail, as drawn.
2. Every other screen in brief 14's table, for the rules. One commit per screen group: listings, create-listing,
   account and dashboard, messages, orders and invoices, auth, legal.
3. Run brief 14's whole spec set over its 25 screens, then contrast.
4. The design documents and the wiki page, recorded from the code, not from the comps.

## Acceptance

- [ ] Listing detail compared with its comps at 1280 light and 390 dark, with the differences listed in the
      outcome note.
- [ ] A Playwright check per screen: at most one filled red button visible in the first screen, and no `font-family`
      containing Cinzel on any element inside a listing, message, review or form field.
- [ ] Brief 14's specs pass over the 25 screens: focus ring, reduced motion, 390 overflow, the theme.
      `contrast.test.ts` passes.
- [ ] The root `CLAUDE.md` and `README.md` name Cinzel, Alegreya Sans and the Roman roles. The outcome note lists
      any file still naming Schibsted Grotesk.
- [ ] `npm run check` passes and `bash corpus/lint.sh` ends clean.
