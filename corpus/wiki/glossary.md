---
summary: The project's vocabulary — Mercatus (formerly PiațăRo) vs my-olx, listing, asset, order, sample listing, platform fee, payout — one definition each with the words it displaces.
updated: 2026-11-21
---

# Glossary

**Mercatus**:
The product's name, as the UI shows it, since 2026-11-21 (Latin for "market"); `BRAND` in
`frontend/src/core/components/brand/brand.ts`. The wordmark letters it MERCATVS, cutting U as V; everywhere else it is
written Mercatus. `my-olx` is the code name of the packages (`@my-olx/*`), and `piataro` stays in the paths, the stack
and the container.
_Avoid_: PiațăRo (the name until 2026-11-21), Mercatvs in sentences, my-olx in user-facing text, OLX.

**Listing**:
What a seller offers: a title, description, price in RON (or free) and at least one asset.
See [listing](listing.md). _Avoid_: ad, anunț in code, product.

**Asset**:
A downloadable file attached to a listing; what the buyer receives. Images are previews, not assets.
See [asset](asset.md). _Avoid_: attachment, upload.

**Order**:
A buyer's purchase of a paid listing; a paid order unlocks its assets. Payments are fake in the demo.
_Avoid_: transaction, purchase (as a noun in code).

**Sample listing**:
A listing seeded at deploy under a seller profile that cannot sign in; it never expires.
_Avoid_: demo listing, fixture.

**Platform fee**:
Mercatus's cut of a paid order, 2.5%, recorded on the order at sale time.
_Avoid_: commission, take rate.

**Payout**:
Money moved from a seller's balance to the seller. In the demo it is simulated: it settles at once and
moves no money. _Avoid_: withdrawal, transfer.
