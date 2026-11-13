# Replies that say too much, and one wrong URL

> Promoted to [brief 15](../briefs/done/15-replies-that-say-less.md) on 2026-11-13.

Found by brief 13 (2026-11-12) while writing the response schemas. The schemas kept every field as it was (the
brief's rule: no reply changes but leaks the comparison shows), so these are still sent.

- **The conversation summary answers the other party's `email` and `phone`** (`features/messaging/`). A buyer
  messaging a seller learns the seller's address and number without asking; the listing has a separate
  "show the seller's phone" route (`/listings/:id/seller-phone`) that is the intended way. Decide what the summary
  needs (a display name, probably) and drop the rest from its schema; check the frontend's messaging screens
  read nothing else.
- **The asset upload answers the storage key `s3_key`.** Internal; the frontend has no use for it. Drop it from the
  schema once the frontend is checked.
- **The avatar upload's `public_url` has no `/uploads/` segment**, unlike every other stored file's URL. Check
  whether the avatar actually loads after an upload (it may only work because the frontend rebuilds the URL), then
  fix the one that's wrong.
- The conversation summary sends its flags as stored `0`/`1`; the messaging schema has booleans for them. One shape.

Each is a reply change: capture before and after (brief 13's method in its outcome note), and say what the frontend
does with each dropped field.
