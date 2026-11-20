fix

The fixes left are small and none of them blocks the briefs. "BRIEF" marks a rule to write into the implementation briefs rather than a sketch fix.

## Round 1: resolved or not

| Round 1 item | Status | Detail |
|---|---|---|
| Desktop first screen | Resolved | The hero ends at y=336, and all 13 tiles plus "Vezi toate" are whole. |
| Phone first screen | Mostly resolved | 4 whole tiles against today's 6. Row 3 is clipped by 12px: 14px from the frieze, 9px from the heading, and 8px per tile from the 48px niches. |
| Search width | Resolved | 873px on desktop, about 330px on phone. |
| Single gold rule | Resolved | |
| Verificat badge | Resolved | The check is back, and the seller badge matches. |
| Phone handles and wreath | Resolved | Removed. |
| Dark red fill | Resolved | `#c24a36`. |
| Dark gold | Resolved | Calmer. |
| Bronze prices | Partly resolved | Cards are fixed; the detail price `.pbig` is not (fix 1). |

## Regressions against today

Category and Listing detail keep today's layout, zones and reach at both widths. Each sits 14px lower because of the frieze. The first card, the title, the price and both actions all stay above the tab bar at 390 and 360. Three things are worse than today:

1. **The detail price uses old-style figures.** In "129", the 1 and the 2 sit at x-height and the 9 drops below the baseline. The page's key number reads smaller and uneven next to today's lining 30px. The range readout ("0 RON") has the same problem. Alegreya Sans uses old-style figures by default, so every number without a setting gets them.
2. **The tonal button is filled with gold.** "Contactează Autorul" uses `#efe2c4` in light and `#3b2f17` in dark. Dark reads as muddy olive, and both break the card's rule that gold is ornament only. Today's tonal button is a tint of the action colour.
3. **Red does more than the identity card says.** Red now marks links, the current tab, segments, the slider, the view toggle, the selected thumbnail and the heart, while the card lists only "one filled action, links, current tab". The screens still read well, because only one thing per screen is filled. A brief built from the card will contradict them.

## Fixes, ranked

1. **Lining figures everywhere** (BRIEF):
   - `:root{font-variant-numeric:lining-nums}`
   - `.pr-p,.pbig,.price output{font-variant-numeric:lining-nums tabular-nums}`
2. **Take the tonal button off gold** (BRIEF):
   - light: `--color-secondary-container:#ece2e8` with `--color-on-secondary-container:#2d1026` (13.7:1)
   - dark: `#3d2735` with `#f3e3ec` (11.1:1)

   That makes it a porphyry tint, and gold stays line-only.
3. **Define red's roles** (BRIEF and the identity card):
   - one filled red action per screen: Caută, Filtre, Descarcă;
   - a red outline and tint for the selected state;
   - red text for links and the current tab;
   - red for controls in use (the slider, an active heart);
   - nothing else.
4. **Phone Home tiles.** Under 600px, use `.cat .d{width:40px;height:44px}`, take 4px off the tile's vertical padding, and set `row-gap:12px`. That recovers about 20px and clears row 3 without truncating anything.
5. **Range readout.** Write `0 RON – 100.000+ RON`, with an en dash spaced on both sides. The em dash is currently attached to one side only.
6. **Identity card.**
   - Change Ink's role to "text" only.
   - Change Bronze's role to "prices, category icons".
   - Add rules 1 and 3. The briefs will be built from this card.

## Rules for the brief, not sketch fixes

- The frieze appears only under the bar and over the footer, and stays 14px tall or less.
- Cinzel page titles must fit the longest category name. Test "Documente & Template-uri Legale" at 390, with `text-wrap:balance` at 24-26px, and never truncate.
- Long IDs use tabular figures at 12px or more.
- Ornament gets `aria-hidden` and no hit area: the frieze, columns, handles and laurels.

## Strengths to keep

- Category and Listing detail read as today's marketplace. The identity lives in the bar, the rules and the colour.
- The trust cues are clear: a check on both verified badges, and a bronze price with its unit.
- Dark is designed: a porphyry bar, a basalt ground, a raised filter band and cards, and a real red fill.

## Heuristics and detector

Every Nielsen heuristic scores 3 out of 4, for a total of 30/40 (round 1: 28).

I ran the detector with its parsers on Category, Detail and Home in both themes, and on the approved twins. Each gives only 2 `cramped-padding` on the `.theme-*` root, which is a false positive. The `.tabula` shadow finding from round 1 is gone.

## Verdict

The identity is now Roman and trustworthy. While these screens become briefs, don't lose today's zones, the weight of the price, or the single red fill per screen.
