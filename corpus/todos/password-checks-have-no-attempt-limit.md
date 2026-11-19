# Password checks have no attempt limit

**Status:** promoted (brief 20, built and closed 2026-11-19)

> Promoted to [brief 20](../briefs/todo/20-wrong-password-tries-are-limited.md) on 2026-11-19.

`POST /auth/login`, `PATCH /users/me/password` and `POST /auth/ward/link-ticket` (brief 19) each check the local
password with no limit on wrong tries. There is one account and this is a demo, so a limit on any one route would not
change what a guesser can do: it would need to sit on all three (per account or per address). For the owner to pick up
or close.
