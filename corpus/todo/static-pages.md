---
title: Static Legal & Info Pages
slug: static-pages
type: add
priority: medium
status: done
area: frontend
updated: 2026-05-29
---

# Static Legal & Info Pages

## What

Add the minimum set of static pages required for legal compliance and trust. All in Romanian.

## Pages needed

| Route | Title | Required by |
|---|---|---|
| `/termeni` | Termeni și Condiții | Romanian consumer law (GEO 141/2021); required for digital content contracts |
| `/confidentialitate` | Politică de Confidențialitate | GDPR / Law 190/2018; linked from cookie banner |
| `/cookies` | Politică de Cookies | Law 506/2004 (amended 2026) |
| `/despre` | Despre my-olx | Trust signal; optional but recommended |
| `/contact` | Contact | Trust signal; ANSPDCP may require contact details |
| `/ajutor` | Ajutor & FAQ | Reduce support load |

## Content notes

**Termeni și Condiții** must include (GEO 141/2021):
- Description of digital content/service
- Seller's legal name and address
- How digital content is delivered (download)
- Right of withdrawal (14-day rule; note digital content exception upon download start)
- Dispute resolution (ANPC, SAL)

**Politică de Confidențialitate** must include (GDPR / Law 190/2018):
- Data controller identity and contact
- What data is collected and why (legal basis for each)
- Data retention periods
- User rights (access, deletion, portability, objection)
- Cookie information
- ANSPDCP contact details for complaints

## Implementation

Simple markdown-rendered static pages or hardcoded JSX. No DB needed. Add links in Footer component.

## Acceptance criteria

- [x] All 6 pages exist and accessible (/termeni, /confidentialitate, /politica-cookies, /despre, /contact, /ajutor)
- [x] Footer links to Termeni, Confidențialitate, Cookies, Despre, Ajutor, Contact
- [x] Cookie banner links to /confidentialitate (route now resolves)
- [x] Termeni covers digital content delivery and right of withdrawal
- [x] Confidențialitate identifies data controller and user rights

## See also

- [[gdpr-cookie-consent]] — banner links to these pages
- [[gdpr-kits]] — market research on GDPR requirements
