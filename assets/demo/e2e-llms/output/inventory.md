# Inventory

Draft for review. Produced by grc-setup-review on 2026-10-19 (Monday). This skill drafts for a human to review and sign; this skill never marks a control effective.

- Library: grcskills `v2026.10.19`, commit `3c6cd538efd3f088bcf594c0aa09ac1059389d7f`, cloned to `.grcskills/` (60 skills indexed by frontmatter).
- Setup inspected: the working folder (`quillfield/`), read-only. No configuration or secrets were opened.

## Answers to the three setup questions

Taken from `README.md`; nobody answered them directly, so please correct anything wrong.

1. **Frameworks**: ISO 27001, aiming at **certification** (two enterprise prospects asked for it). GDPR applies as a **legal obligation** (EU and UK customers, invoice data, employee and prospect personal data; UK GDPR for the UK side). EU AI Act may be relevant because an AI feature shipped last quarter (to confirm). NIS 2 and DORA: no sign they apply (not assessed).
2. **Next deadline**: the CTO wants a certification audit **within six months**, so roughly April 2027. No customer review dates were given.
3. **People and hours**: no full-time security or compliance person. **Assumed: about 8 hours a week**, mostly the CTO plus one engineer. Not confirmed; the 30-day plan is sized to this.

## Artefacts found

File dates are all the checkout date, so they tell us nothing. Dates below come from each document's own control block; "undated" means it has none.

| Path | Type | Version | Approval / next review | Owner | Serves |
|---|---|---|---|---|---|
| `README.md` | Company context | n/a | undated | none | context |
| `policies/information-security-policy.md` | Top-level policy | 1.0 | Approved by the CEO at the founding board meeting; next review "12 months after approval". README says the set is two years old and never reviewed, so **overdue** | Head of Engineering (**role vacant**) | ISO 27001 |
| `policies/access-control-policy.md` | Topic policy | 1.0 | undated | Head of Engineering (**role vacant**, stated in the file) | ISO 27001 |
| `policies/incident-response-plan.md` | Plan | Draft | undated, not approved | CTO | ISO 27001, GDPR |
| `registers/risk-register.csv` | Risk register, 8 rows | none | All rows last reviewed "Q1 last year" | Per row; R2, R5, R7 have none | ISO 27001 |
| `registers/statement-of-applicability.csv` | Statement of applicability, 8 rows | none | undated | none | ISO 27001 |
| `registers/asset-inventory.csv` | Asset inventory, 6 rows | none | undated | Per row; legacy reporting server has none | ISO 27001 |
| `registers/vendors.csv` | Vendor register, 6 rows | none | undated | none | ISO 27001, GDPR |
| `incidents/incident-log.csv` | Incident log, 2 rows | none | Entries "Spring last year", "Autumn last year" | none | ISO 27001, GDPR |
| `evidence/README.md` | Evidence index | none | undated | none | ISO 27001 |

## Could not see

- The evidence itself: `evidence/README.md` lists an SSO settings screenshot, a backup configuration export and an onboarding training deck, but **none of those files is in `evidence/`**.
- Cloud console (production database, backups, region setup).
- Single sign-on and MFA provider, and the HR or leaver process.
- Code hosting and CI (secret scanning, branch protection, secrets stored in CI).
- The `#incidents` chat channel and the on-call rota.
- Contracts and DPAs for the six vendors, and the AI model API's click-through terms.
- The AI dispute-email feature: its prompts, data flow and logs.
- The legacy reporting server in the office rack, including its shared admin login.
- CRM, payroll provider and transactional email service accounts.
- Any training platform or completion records (the evidence README says there are none).
- Any customer-facing privacy notice, records of processing, or security questionnaire answers already sent.
