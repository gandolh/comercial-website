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
