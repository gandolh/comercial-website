# PiațăRo tokens: board role to app token

Mechanism: the app's own `@theme` block (light) plus `:root[data-theme="dark"]` (dark). Every Material 3 role keeps its name and gets a new value; the Light / Dark / System switch is unchanged.

## Renamed or remapped (board role to app token)
- ground -> `background` and `surface` (same value); on-ground -> `on-background`, `on-surface`
- card, band, sheet, menu -> `surface-container-lowest` (in dark it is the lightest container, so cards lift; Material 3's order is inverted on purpose)
- well, track, chip -> `surface-container-low`; footer -> `surface-container`
- muted text -> `on-surface-variant` (the result count and the filter titles leave `outline`, which stays for boundaries)
- edge -> `outline-variant`; field and switch edge -> `outline`
- accent -> `primary`; button hover -> `primary-container` (with `on-primary`); chosen segment -> `primary-fixed` + `on-primary-fixed`
- tonal button (Contactează Autorul) -> `secondary-container` + `on-secondary-container` (replaces the cyan pill)
- verified badge and the switch's on state -> `tertiary-container` + `on-fill`; switch ring -> `tertiary`
- toast -> `inverse-surface`, `inverse-on-surface`, action `inverse-primary`
- focus ring -> `primary` through `shadow-focus` (no `--color-focus` added)
- type: Manrope and Inter -> Schibsted Grotesk in `font-headline`, `font-body`, `font-label`
- radii: segment 8 -> `radius-lg`; card, track 12 -> `radius-xl`; CTA, sheet 16 -> `radius-2xl`
- shadows: card -> `shadow-card`; popup and menu -> `shadow-popup`
- teal leaves the UI: `secondary` is now slate blue and appears only in the footer wordmark; the app's `secondary-fixed*` and `tertiary-fixed*` get values but no screen here uses them

## New tokens (component that needs them)
- `nav-band`, `on-nav-band`, `on-nav-band-variant`: the navy top bar, its places, the wordmark's `Ro`, the home CTA band
- `radius-control` (10): buttons, sort select, search field
- `shadow-band`: the raised filter band and the home hero; `shadow-bar`: the phone bottom bar
- `--text-hero`, `--text-title`, `--text-price`, `--text-body`, `--text-card-title`, `--text-control`, `--text-label` (each with line height and weight): the app had no `--text-*` tokens
- `Filtre` (string, both locales) and `Aplică filtrele`, `Mai multe filtre`, `Fără previzualizare` (strings the phone sheet and the rare-facets control need); sentence case for `Verificat`, `Vânzător verificat`

## App tokens the design no longer uses (keep or drop is the code brief's call)
- `surface-bright`, `surface-dim`, `surface-variant`, `surface-container-high`, `surface-container-highest`, `surface-tint`, `*-fixed-dim`, `*-fixed-variant`: given values in the new palette, no screen here draws them
- `error-container` is used only by the load-error box; `inverse-primary` only by the toast action
- `shadow-ambient` and `shadow-search`: kept with new tints; the home search field no longer has a drop shadow, so `shadow-search` is unused
- `--color-rating` is untouched (no ratings on these screens)
- the `.material-symbols-outlined` icon font: the board draws Lucide-style inline strokes; keeping the font is a code-brief call
