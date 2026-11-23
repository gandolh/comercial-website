# README images

How each image was made, so the next refresh is a re-run. Re-take an image
when the screen it shows changes. All five were retaken on 2026-11-21, after
the Roman identity and the rename to Mercatus (corpus briefs 21-26), on top of
the redesign of 2026-11-13 ("The filter band", corpus brief 14).

The API ran on a scratch `DATABASE_PATH`, `UPLOADS_DIR` and `ASSETS_DIR`,
seeded with `npm run seed:samples` and nothing else: the nine sample listings
the demo shows, their preview pictures and two reviews. Every shot is signed
out, in the default light theme, with the time zone Europe/Bucharest. Nobody
real appears. The titles, sellers, reviewers and pictures are invented.

| File | Shows | How to reach that state | Viewport | Taken |
|---|---|---|---|---|
| hero.webp | The listings page: the filter band and two rows of results | `/anunturi` | 1440×1052 @2x, the whole viewport, scaled to 1600 px wide | 2026-11-21 |
| listing-buy.webp | A paid listing: format, size, licence, the buy box, the locked file and two reviews | `/anunturi/sample-icons`; clipped from 44 px above the "Descriere" heading to 20 px below "Raportează Anunțul" | 1440×1500 @2x, clip scaled to 1600 px wide | 2026-11-21 |
| categories.webp | The home page's category grid | `/`; clipped from 36 px above "Categorii Populare" to 46 px below the "Diverse" card | 1440×1000 @2x, clip scaled to 1600 px wide | 2026-11-21 |
| phone-browse.webp | The listings page on a phone, with the bottom bar | `/anunturi` | Playwright's `iPhone 14` (390×664 @3x), the whole viewport, scaled to 780 px wide | 2026-11-21 |
| phone-filters.webp | The phone filter sheet with one pick staged | `/anunturi`, tap **Filtre**, then **Comercială** in the sheet | same as phone-browse | 2026-11-21 |

## Steps

1. Seed a scratch database and start the API on it, in one terminal:

   ```bash
   cd backend && npm ci
   export DATABASE_PATH=/tmp/mercatus-shots/mercatus.db UPLOADS_DIR=/tmp/mercatus-shots/uploads ASSETS_DIR=/tmp/mercatus-shots/assets
   npm run seed:samples
   JWT_SECRET=$(openssl rand -hex 32) npm run dev
   ```

2. Start the frontend in a second one: `cd frontend && npm ci && npm run dev`.
   On other ports, set `PORT` and `CORS_ALLOWED_ORIGINS` for the API, and
   start Vite with `VITE_API_URL=<api> npx vite --port <port> --strictPort`.

3. In Playwright (Chromium), open each page in a fresh context with
   `timezoneId: "Europe/Bucharest"`, after an init script sets
   `localStorage.cookie_consent = "rejected"` and `localStorage.theme = "light"`
   so the cookie banner stays closed. Wait for network idle and
   `document.fonts.ready`, then 1.5 s more. Take the shots in the table, with a
   `clip` where it names one.

4. Convert each PNG:

   ```bash
   ffmpeg -i in.png -vf "scale=1600:-1:flags=lanczos" -c:v libwebp -quality 82 out.webp   # 780 for the phone shots
   ```

## Not taken

- **Signed-in screens.** The account pages (dashboard, my listings, orders,
  invoices, messages, settings) all load, but for a new demo account they are
  empty, and a sample seller cannot sign in. The README shows the public side
  only.

## Preview pictures

The sample listings' previews in `backend/seed/samples/previews/` were drawn by
[demo-previews.html](demo-previews.html) from shapes and invented text, so no
real product, brand or person appears. To redraw one, open the page with its
name as the hash in a 1200×960 viewport and screenshot it. The names are
`icons`, `dashboard`, `ebook`, `loops`, `fonts`, `social`, `gdpr`, `invite` and
`code`:

```bash
for n in icons dashboard ebook loops fonts social gdpr invite code; do
  agent-browser --session previews set viewport 1200 960 1
  agent-browser --session previews open "file://$PWD/docs/images/demo-previews.html#$n"
  agent-browser --session previews reload   # a hash change alone does not re-run the page script
  agent-browser --session previews screenshot "$PWD/backend/seed/samples/previews/$n.png"
done
```
