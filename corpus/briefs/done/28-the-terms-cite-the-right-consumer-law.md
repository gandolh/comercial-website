# Task 28: The terms cite the right consumer law

**Depends on:** nothing. **Runs before:** nothing.

## Context

Found on 2026-11-23 while checking the estate's pages against
[lexifina/romania-law](https://github.com/lexifina/romania-law) (commit `2d4c02b`), a git copy of the official
texts from the Ministry of Justice's legislation portal. Two claims on the Termeni page
(`frontend/src/app/modules/legal/pages/TermeniPage.tsx`) are wrong.

**Section 4 cites the wrong act.** Its title is "Dreptul de retragere (GEO 141/2021)" and its text says the
14-day right comes from GEO 141/2021. OUG 141/2021 is about the conformity of digital content and digital
services and the remedies for it (`oug/2021/141/art-001.md@2d4c02b`). The withdrawal right is in OUG 34/2014:
- art. 9 alin. (1): 14 days to withdraw from a distance contract (`oug/2014/34/art-009.md@2d4c02b`);
- art. 16 alin. (1) lit. m): no withdrawal right for digital content not on a physical medium once performance
  has begun, if (i) the consumer gave prior express consent to start during the withdrawal period, (ii) the
  consumer acknowledged losing the right, and (iii) the trader provided the contract confirmation under art. 7
  alin. (2) or art. 8 alin. (7) (`oug/2014/34/art-016.md@2d4c02b`).

The page lists the first two conditions and leaves out the third.

**Section 8's "SAL" link goes to a platform that no longer exists.** The link is `ec.europa.eu/consumers/odr`,
the EU's online dispute resolution platform (SOL in Romanian, not SAL). Regulamentul (UE) 2024/3228 repealed
the regulation behind it from 2025-07-20 and closed the platform (`ue/regulament/2024/3228/text.md@2d4c02b`).
SAL, alternative dispute resolution, is the national procedure set up by OG 38/2015
(`og/2015/38/art-001.md@2d4c02b`); the build finds ANPC's SAL page and checks it answers.

Upstream marks OUG 34/2014 `stale`: its newest form held is from 2022-07-20, last checked against the portal on
2026-01-19. So confirm both articles on the official page before writing:
`https://legislatie.just.ro/Public/DetaliiDocument/158913`.

The pages are demo boilerplate, not lawyer-reviewed ([legal-and-compliance.md](../../wiki/legal-and-compliance.md)),
and Mercatus is a demo with fake payments ([decisions.md](../../wiki/decisions.md)). This brief fixes what the
page gets wrong and adds nothing else.

## Files you OWN

- `frontend/src/app/modules/legal/pages/TermeniPage.tsx`
- A new spec, `frontend/e2e/legal-citations.spec.ts`
- [wiki/legal-and-compliance.md](../../wiki/legal-and-compliance.md), [wiki/status.md](../../wiki/status.md),
  [log.md](../../log.md)

## Files you must NOT touch

- The other legal pages, the checkout and download flow, the backend.

## What to do

1. Read OUG 34/2014 art. 9 and art. 16 on the official page and confirm the wording above still holds. If a later
   amendment changed it, follow the official text and say so in the outcome note.
2. Section 4: title "Dreptul de retragere (OUG nr. 34/2014)". The 14 days cite art. 9 alin. (1). The exception
   cites art. 16 alin. (1) lit. m) and lists its three conditions in plain Romanian. Drop the GEO 141/2021
   citation. Keep the closing sentence about starting the download only if it still reads true next to the
   three conditions; otherwise cut it.
3. Section 8: relabel and relink the second item to ANPC's SAL page, after checking the address answers. Drop the
   ODR link.
4. The spec: on `/termeni`, the page shows "OUG nr. 34/2014", doesn't show "141/2021", and has no link to
   `ec.europa.eu/consumers/odr`.
5. Update the legal-and-compliance page's Termeni line, the status line and the log.

## Acceptance

- [ ] Termeni section 4 cites OUG nr. 34/2014 art. 9 and art. 16 alin. (1) lit. m) with all three conditions;
      GEO 141/2021 appears nowhere on the page.
- [ ] Section 8 has no ODR link; its SAL item points to an ANPC page that answered when the build checked it.
- [ ] The new spec passes; `npm run check` passes in `frontend/`; `bash corpus/lint.sh` ends clean.
- [ ] The outcome note names the official page and the day it was read.

## Owner decisions

- The demo says "Prin inițierea descărcării, confirmi pierderea dreptului de retragere", but the checkout asks for
  no express consent, which art. 16 lit. m) needs. A consent tick at checkout is out of this brief. Add it in a
  later brief, or leave it for a demo with fake payments?

## Outcome (2026-11-24)

Built. Termeni section 4 is titled "Dreptul de retragere (OUG nr. 34/2014)": the 14 days cite art. 9 alin. (1), the
exception cites art. 16 alin. (1) lit. m) with its three conditions, and GEO 141/2021 appears nowhere. The closing
sentence ("Prin inițierea descărcării, confirmi pierderea dreptului de retragere") was cut: the checkout asks for no
express consent, so it would read false next to the three conditions. Section 8's SAL item links
`https://reclamatiisal.anpc.ro/` (ANPC's SAL complaint platform; checked on 2026-11-24: HTTP 200, "Depune cerere SAL").
ANPC Order 270/2026, which amended Order 449/2022, made it the SAL address and dropped the ODR/SOL references; the
source is a press summary of ANPC's communiqué, not the Order's text. The ODR link is gone.

Official text read: `https://legislatie.just.ro/Public/DetaliiDocument/158913` (OUG 34/2014), on 2026-11-24. Art. 9
alin. (1) and art. 16 alin. (1) lit. m) held as the brief says (lit. m) last amended by OUG 58/2022); no later change.

Checks: `e2e/legal-citations.spec.ts` passes against Vite; `npm run check` passes (one backend test,
`attempt-limit`, timed out once under load and passed on the rerun); `bash corpus/lint.sh` clean.

Open owner decision: the checkout asks for no prior express consent, which art. 16 lit. m) needs. Add a consent tick in
a later brief, or leave it for a demo with fake payments?
