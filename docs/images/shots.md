# README images

How each image was made, so the next refresh is a re-run. Re-take an image
when the screen it shows changes.

All of them come from a throwaway clone of the repo, with the API on a scratch
`DATABASE_PATH` and `UPLOADS_DIR`. The accounts and the first five listings are
the demo data the migrations insert. [demo-seed.mjs](demo-seed.mjs) gives those
listings preview pictures, adds four more listings with small ZIP files, and
adds two reviews. Every preview is drawn by
[demo-previews.html](demo-previews.html) from shapes and invented text, so no
real product, brand or person appears.

| File | Shows | How to reach that state | Viewport | Taken |
|---|---|---|---|---|
| hero.webp | The listings page with filters and 9 results | `/anunturi`, signed out | 1440×900 @2x, scaled to 1600 px wide | 2026-10-16 |
| listing-buy.webp | A paid listing: format, size, licence, the buy box, the locked file and two reviews | `/anunturi/10000000000000000000000000000001`, scrolled down 1000 px; cropped to y 272 to 1340 of the 2880×1800 capture | 1440×900 @2x, crop scaled to 1600 px | 2026-10-16 |
| categories.webp | The home page's category grid | `/` signed in, scrolled down 480 px; cropped to y 180 to 1660 | 1440×900 @2x, crop scaled to 1600 px | 2026-10-16 |
| phone-browse.webp | The listings page on a phone | `/anunturi`; cropped to the top 2000 px | iPhone 14, 390×844 @3x, crop scaled to 780 px | 2026-10-16 |

Before capturing, set `localStorage.cookie_consent = 'rejected'` on the app's
origin so the cookie banner stays closed. The listing crop stops above the
"Sfaturi de siguranță" box, which still carries advice from the physical-goods
version (meet the seller in a public place).

## Not taken

- **The "Adaugă anunț" form.** For a new listing the page shows a spinner and
  never loads. `useDraft` disables its query when there is no draft id, and
  React Query v5 reports a disabled query with no data as pending, so
  `isDraftLoading` stays true.
- **"Anunțurile mele".** The page calls `GET /me/listings`, which the API does
  not have (404), and shows "Nu am putut încărca anunțurile".
- **The listing page on a phone.** The "Descriere" heading and the listing id
  overlap at that width.
- **Invoices.** The "Factură nouă" tab did not open in the headless browser;
  not looked into further.

## Demo data

1. Clone the repo outside your working copy, then `npm install` and
   `npm run build` in `backend/`, and `npm install` in `frontend/`.
2. Render the previews, one PNG per name, at 1200×960:

   ```bash
   mkdir -p /tmp/previews
   for n in icons dashboard ebook loops fonts social gdpr invite code; do
     agent-browser --session previews set viewport 1200 960 1
     agent-browser --session previews open "file://$PWD/docs/images/demo-previews.html#$n"
     agent-browser --session previews reload   # a hash change alone does not re-run the page script
     agent-browser --session previews screenshot /tmp/previews/$n.png
   done
   ```

3. Start the API on scratch paths, and the frontend:

   ```bash
   cd backend && JWT_SECRET=$(openssl rand -hex 32) \
     DATABASE_PATH=/tmp/olx-demo/my-olx.db UPLOADS_DIR=/tmp/olx-demo/uploads npm run dev
   cd frontend && npm run dev
   ```

4. Once the API is listening, seed it. The password is the one in the comment
   at the top of `backend/migrations/20260428010000_seed_data.sql`:

   ```bash
   read -rs -p 'Demo password: ' DEMO_PASSWORD && export DEMO_PASSWORD
   node docs/images/demo-seed.mjs /tmp/previews
   ```

   It prints `Gave 5 seeded listings a preview, added 4 listings and 2 reviews.`
   Run it once per fresh database; a second run stops partway, on the weekly
   listing limit.

## Capture method

- Browser: `agent-browser --session olx-readme`, `set viewport 1440 900 2` for
  desktop, `set device "iPhone 14"` for the phone, then `screenshot` with an
  absolute path. Sign in through `/autentificare` as `jane.doe@example.com`
  for the signed-in shots.
- Stills: PNG to WebP with
  `ffmpeg -i in.png -vf "crop=...,scale=1600:-1:flags=lanczos" -c:v libwebp -quality 82 out.webp`
  (780 for the phone).
