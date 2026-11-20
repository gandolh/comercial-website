# The redesign: "The filter band"

This folder is the design record of PiațăRo's redesign. The estate redesign board, where it was drawn and approved, is a private canvas; this is a copy of the app's page on it plus the build behind that page. The owner approved it on 2026-11-13, and [brief 14](../../corpus/briefs/done/14-a-redesign-with-hallmark-on-the-estate-board.md) built it. The code is now the source of truth: where the app and these files differ, the app wins, and later work may have moved a screen on. Read this folder to see what was decided and why before reshaping a screen.

## The owner's decisions

The owner approved the whole board on 2026-11-13, with every question standing at what the board proposed unless they reopened it. The questions this app's page asked:

- **Ask:** 1. Reopened: the Carpathian Clear identity (Manrope and Inter become Schibsted Grotesk; the blue becomes Voroneț azure with a navy shell; teal leaves; the two-tone wordmark's colours change). Is a new look on the table? 2. Reopened: phone navigation as a five-place bottom bar (Acasă, Categorii, Favorite, Mesaje, Conectare or Contul meu) instead of brief 14's menu Drawer. OK? 3. Approve The filter band as PiațăRo's direction?
- **Open question:** The app prints a free listing as "0 RON" on Home and Detail (the seed stores price_ron 0; only null prints Gratuit). The comps draw 0 RON. Product question for the owner: show 0 as Gratuit?
- **Open question:** Contactează autorul appears twice on Detail (the price card and the seller card), as today. Keep both, or one? The comp keeps both.
- **Reopened:** Recorded (wiki/carpathian-clear.md, type table: Headlines Manrope, Body Inter; brief 14, Decisions: "A different brand identity is a reopened decision, flagged on the board"). Proposed: one face, Schibsted Grotesk; primary #1a5f9e, a navy nav-band, teal only gone from the UI.
- **Reopened:** Recorded (brief 14, step 5: decide "the missing phone navigation panel ... proposed, as a Drawer"). Proposed: a bottom bar of five places instead, the estate's default for phones; Adaugă Anunț stays in the top bar when signed in.
- **Reopened:** Copy: sentence case for Verificat, Vânzător verificat, Resetează Filtre and Autor Verificat (today VERIFICAT and VÂNZĂTOR VERIFICAT are CSS-uppercased tracked caps; locale key listing.verified holds "VERIFICAT"). New strings: Filtre, Aplică filtrele, Mai multe filtre, Fără previzualizare. Meaning unchanged.

Where the files below disagree, the later layer wins: the owner's decisions, then the controller's rulings, then the judges' rulings, then the directions file.

## What is here

| Path | What it holds |
|---|---|
| `directions/comercial-website.md` | The director's brief: both directions (the winner is the one built), the shared fixture and the screens to draw. |
| `judge/comercial-website/RESULT.md` | The blind judging against today and the rulings that came with the win. |
| `critiques/comercial-website-controller.md`, `critiques/comercial-website.md` | The design critic's review against today, and the controller's rulings over it. |
| `manifests/comercial-website.tokens.css`, `manifests/comercial-website.tokens-map.md` | The token hand-off in the app's own names, and the renamed, new and unused tokens. |
| `manifests/comercial-website.board-notes.md` | What the board said beside the screens: the asks, decisions, reopened rules, open questions, the contrast table and the runner-up. |
| `work/comercial-website/twins/*.html` | Each drawn screen as static HTML, light and dark: open one in a browser. |
| `work/comercial-website/shots/` | The twins rendered at 1280 and 390, light and dark, WebP. `direction.webp` is the board's direction sheet. |
| `shots/comercial-website/` | Today's screens as the board showed them before the redesign. |

People's names and data in the pictures come from seeded demo accounts or are invented.

## Not here

The sketches and the judges' images, the runner-up's build (its notes are in the board's notes), the build's scripts, and the screenshots taken while it was built. They stay in the estate build folder.
