# Password checks have no attempt limit

`POST /auth/login`, `PATCH /users/me/password` and `POST /auth/ward/link-ticket` (brief 19) each check the local
password with no limit on wrong tries. There is one account and this is a demo, so a limit on any one route would not
change what a guesser can do: it would need to sit on all three (per account or per address). For the owner to pick up
or close.
