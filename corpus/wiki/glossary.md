---
summary: The project's vocabulary — PiațăRo vs my-olx, listing, asset, order, sample listing, platform fee, payout — one definition each with the words it displaces.
updated: 2026-11-03
---

# Glossary

**PiațăRo**:
The product's name, as the UI shows it. `my-olx` is the code name of the packages (`@my-olx/*`).
_Avoid_: my-olx in user-facing text, OLX.

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
PiațăRo's cut of a paid order, 2.5%, recorded on the order at sale time.
_Avoid_: commission, take rate.

**Payout**:
Money moved from a seller's balance to the seller. In the demo it is simulated: it settles at once and
moves no money. _Avoid_: withdrawal, transfer.
