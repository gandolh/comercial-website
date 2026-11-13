# Task 14: A redesign with Hallmark, on the estate board

**Depends on:**

- In comercial-website: [brief 12](../done/12-base-ui-by-the-conventions.md), which settles the Base UI wrappers, the z, shadow and rating tokens, `cn()` and the Light / Dark / System switch. A redesign is then mostly a new token set and layout. Brief 11's formatter and lint run on every redesign commit.
- In the owner's skills library:
  - brief 24, which vendors Hallmark as the design skill and adopts taste-skill 2.5's ideas (palettes and type dealt by trade, its copy layer);
  - the estate redesign board: one artifact with a page per app, owned by the skills library.
- The owner's answer of 2026-11-10 (Q39): no bake-off; Hallmark redesigns every web UI, keeping what is useful from taste-skill 2.5, and the owner approves each app on the board before any code changes.

**Runs before:** nothing. **Runs after:** 11 and 12, the redesign last. Brief 13 is server-only and does not block it.

## Context

PiațăRo is a deployed demo of a Romanian classifieds marketplace: only the owner signs in, and the public browses read-only. Its UI is Romanian first, with an English switch, and a visitor mostly browses, searches, reads a listing and contacts a seller.

### The screens (read 2026-11-10, `frontend/src/app/modules/*/routes`)

| Screen | Route | File |
|---|---|---|
| Home | `/` | `home/pages/HomePage.tsx` |
| Categories, and a category with its filters | `/categorii`, `/categorii/:slug` | `categories/pages/CategoryIndexPage.tsx`, `CategoryPage.tsx` |
| Search results | `/anunturi` | `search/pages/SearchResultsPage.tsx` |
| Listing detail, and edit | `/anunturi/:id`, `/anunturi/:id/editeaza` | `listings/pages/ListingDetailPage.tsx`, `EditListingPage.tsx` |
| Create a listing, the wizard | `/adauga-anunt`, `/adauga-anunt/:draftId` | `create-listing/pages/CreateListingPage.tsx` |
| Favourites | `/favorite` | `favorites/pages/FavoritesPage.tsx` |
| Messages | `/mesaje`, `/mesaje/:conversationId` | `messaging/pages/ConversationsPage.tsx`, `ConversationPage.tsx` |
| Orders, and the confirmation | `/comenzi`, `/comenzi/confirmare` | `orders/pages/MyOrdersPage.tsx`, `OrderConfirmationPage.tsx` |
| Account: dashboard, my listings, settings, invoices | `/cont`, `/cont/anunturi`, `/cont/setari`, `/facturi` | `dashboard/pages/`, `settings/pages/SettingsPage.tsx`, `invoices/pages/InvoicesPage.tsx` |
| A public profile | `/utilizator/:id` | `public-profile/pages/PublicProfilePage.tsx` |
| Sign in, Ward return, email verify | `/autentificare`, `/autentificare/ward`, `/verifica-email` | `auth/pages/` |
| Legal and help: terms, privacy, cookies, about, contact, FAQ | `/termeni`, `/confidentialitate`, `/politica-cookies`, `/despre`, `/contact`, `/ajutor` | `legal/pages/` |
| The shell: navbar, footer (with the theme switch), cookie banner, toasts | every page | `core/components/layout/Navbar.tsx`, `Footer.tsx`, `MainLayout.tsx`, `AuthLayout.tsx`, `core/components/ui/CookieConsent.tsx` |

### What the design docs fix today

- [wiki/carpathian-clear.md](../../wiki/carpathian-clear.md) and `design/design-system/carpathian-clear.json` hold the Carpathian Clear system: Material 3 colour roles (primary `#0056D2`, secondary `#008B8B`, tertiary `#2E7D32`), the type pairing and the shape rules. The tokens live in the `@theme` block of `frontend/src/index.css`. The mock-ups in `design/code/` and `design/screenshots/` are the original comps.
- [wiki/decisions.md](../../wiki/decisions.md) holds the locks that bear on the UI: a deployed demo with fake payments, the owner as the only account, a Romanian UI with correct diacritics and prices in RON.
- The theme switch is the owner's call of 2026-11-10 (Q18): Light / Dark / System, light on a first visit, `data-theme` through `@custom-variant`. Brief 12 builds it and records the dark palette, which the owner reviews from that brief's screenshots.
- [corpus/CLAUDE.md](../../CLAUDE.md) lists the invariants: Romanian copy with correct diacritics, RON prices, exact pins.

The redesign stays inside these. A different brand identity is a reopened decision, flagged on the board.

## Decisions

Decided 2026-11-10 (owner, Q39): Hallmark, with taste-skill 2.5's useful parts; the owner approves each app on the board before any code changes. Default: the proposal keeps the Material 3 role names (so brief 12's tokens keep working), the two languages and the marketplace's information structure. Anything that moves one of those is flagged on the board as a reopened decision.

## Files you OWN

- `frontend/src/index.css` (the tokens, both themes) and the pages and layout components listed above, one commit each.
- `design/design-system/carpathian-clear.json` and [wiki/carpathian-clear.md](../../wiki/carpathian-clear.md), recorded from the shipped result.
- Corpus: [wiki/decisions.md](../../wiki/decisions.md) (a design entry, if the look changes), [wiki/status.md](../../wiki/status.md), [log.md](../../log.md).

## Files you must NOT touch

- `backend/`, `infrastructure/` and `seed-data/`.
- Behaviour: queries, forms, the wizard's steps, the checkout and the messaging flow.
- Romanian copy's meaning and diacritics; both locale files keep their keys. No invented listings, prices, reviews or counts: the sample listings and their photographs are the seed data's.

## What to do

1. **Today.** Take Playwright screenshots of every screen above at 1280 and 390 px, in light and dark, kept out of git, against the seeded samples. Include the filter sidebar, a listing with its gallery, the create-listing wizard at each step, an open modal and a toast.
2. **Propose.** With Hallmark (and taste-skill 2.5's trade palettes and copy layer where they help), make a proposal per screen, inside the recorded decisions. Check each against the Floor: contrast, a visible focus ring, a reduced-motion path, no invented facts, no broken phone layout.
3. **Board.** Put the proposals on this app's page of the estate board, beside today's screenshots at both widths.
4. **Approval.** The owner approves on the board. Nothing below starts before that, and the approval is recorded in `log.md` with its date.
5. **Build.** First as a token change in `index.css` (colour roles, radii, shadows, type, spacing, both themes), then one screen per commit. Keep the Base UI wrappers, the theme switch and the phone layout working, and decide with the owner on the board whether the missing phone navigation panel (brief 12's note on Q40) is proposed, as a `Drawer`.

## Acceptance

- [ ] The owner's approval is on the board and recorded in `log.md` with the date.
- [ ] Contrast: every text and icon pair in both themes clears 4.5:1 (3:1 for large text and UI parts), measured with a script over the built tokens and listed in the outcome note.
- [ ] A Playwright test tabs through each screen and asserts a visible focus ring on every stop.
- [ ] A Playwright test with `reducedMotion: "reduce"` asserts no running animation or transition on each screen.
- [ ] A Playwright test at 390 px asserts `document.documentElement.scrollWidth <= window.innerWidth` on each screen.
- [ ] Every price, title and figure shown comes from the seed data or the locale files; the outcome note lists none invented. Every Romanian string keeps its diacritics.
- [ ] The theme checks from brief 12 still pass in light, dark and system.
- [ ] `npm run check` passes at the repo root, and `bash corpus/lint.sh` ends clean.

## Interplay

- Brief 12 owns the wrapper layout, the tokens' names and the theme switch; this brief changes the values and layout on top. The switch must survive in both themes.
- Brief 11's formatter and lint run on every redesign commit.
- The frontend is built in the owner's checkout (`docs/deploy.md`), so the owner reruns `npm install` in `frontend/` if the dependencies move.

## Outcome (2026-11-13)

Built as the approved direction "The filter band" (runner-up: "Carpathian Clear, settled"). The owner approved it on
the estate redesign board on 2026-11-13 with every question standing as proposed ([log.md](../../log.md)).
Reopened decisions, recorded in [decisions.md](../../wiki/decisions.md) and
[carpathian-clear.md](../../wiki/carpathian-clear.md): the new identity (Schibsted Grotesk, Voroneț azure `#1a5f9e`,
a navy `nav-band`, teal gone), a five-place bottom bar for phones instead of a Drawer, and the phone filter sheet
that applies its picks together (a **behaviour change**: it applies from `Aplică filtrele`, where each pick used to
apply at once; the wide band still applies each pick at once).

- **Commits:** the approval; tokens, fonts, `cn()` lists and the theme-colour constants; the shell (navy top bar in
  flow, `BottomBar`, footer, theme switch); the UI primitives (Button, Input, Select, Textarea, Badge, Chip, Card,
  Switch, Dropdown, Modal, ConfirmDialog, Toast, Slider, a new `Sheet`); category (and search, which shares the band);
  home; detail; the undrawn screens; contrast and Playwright specs; fixes; the design documents.
- **Not built:** `Mai multe filtre` (no category has a fourth facet; the owner's call). The Material Symbols icon
  font keeps its Google Fonts link (owner's call), so icons differ from the board's stroke icons.
- **New strings** (both locales): `filters.title` Filtre / Filters, `filters.apply` Aplică filtrele / Apply filters,
  `listing.noPreview` Fără previzualizare / No preview. Changed: `listing.verified` VERIFICAT → Verificat, VERIFIED →
  Verified. `SellerCard` now says `Vânzător verificat`. No other wording was written.
- **Contrast** (`frontend/src/contrast.test.ts`, 39 pairs per theme over the stylesheet's own tokens): light text min
  5.36, large text min 5.83, UI parts min 3.40; dark text min 5.12, large min 9.64, UI parts min 4.08. Brief 12's
  `index.css.test.ts` still passes.
- **Specs** (`frontend/e2e/`, Playwright 1.63.0, Chromium, `--workers=2`; they run against a dev server and a seeded
  scratch API, see `playwright.config.ts`): a visible focus ring on every Tab stop, no running animation under
  reduced motion, no horizontal overflow at 390 in light and dark, and the theme switch, each over 25 screens (the
  dev seed's own samples and dev account); plus the filter band and sheet, and the cookie banner, a toast and a
  modal. 107 vitest tests pass. A first-time `npm run check` is green; `check-base-ui` 0 and 0.
- **First screen**, as the board measured it: the category's first card spans y 310 to 639 at 1280 by 800 (today's
  board shot: 192 to 587, with the filter column running past the fold); home tiles whole in the first screen: 14 of
  14 at 1280, 6 of 14 at 390 and at 360 (the board's twin showed 4 at 360).
- **Against the comps** (rendered twins, share of pixels differing, light/dark): home 1280 1.2/1.3 %, 390 4.1/4.3 %;
  category 1280 1.5/1.5 %, 390 8.8/6.3 %; detail 1280 3.2/4.4 %, 390 8.3/7.2 %; category scrolled to the end at 390
  11.2/7.9 %. What differs: Material Symbols against the board's stroke icons; the fixtures' own times and view counts;
  the twin marks Categorii on the detail page, the app does not (a listing is not a Categorii route); the filter
  chip rail's cut and the sheet are real controls the twin only sketches; the footer's last row sits flush against the
  bottom bar because the bar is in flow.
- **Owner steps:** `npm install` in `frontend/` (two new pins); then the deploy.

### Deviations
- Base UI rule 15 (a phone navigation panel is a Drawer) gave way to the owner-approved bottom bar. The filter sheet
  is a `Dialog` bottom sheet in `components/ui/Sheet`, since it holds a staged form, not a panel to swipe shut.
- A removable chip is a label with a remove button beside it (the old `Chip` nested a button in a button).
- `README` and root `CLAUDE.md` still name Manrope, Inter and `#0056D2` (root `CLAUDE.md`, "Design system"); they
  were outside the files this brief owns and are left for the owner.
