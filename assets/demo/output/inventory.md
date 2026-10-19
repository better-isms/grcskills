# Inventory

Drafted by the grc-setup-review skill on 2026-10-19 for a human to review and sign. This skill drafts for a human to review and sign; this skill never marks a control effective.

- Library: better-isms/grcskills, release tag `v2026.10.19` (annotated tag object `98cf89c`, commit `3c6cd538efd3f088bcf594c0aa09ac1059389d7f`), 60 skills, cloned read-only to `.vendor/grcskills/`.
- Setup inspected: this working folder (`quillfield/`), read-only.
- Framework lookup connection: not connected. Missing items in `audit.md` are marked "to confirm".

## Step 3 answers

The three scoping questions were not asked live; the answers below come from `README.md` and are marked where they are assumptions. Correct them and re-run the ranking if they are wrong.

| Question | Answer used | Source |
|---|---|---|
| Frameworks in scope | ISO 27001 (certification). GDPR and UK GDPR as legal obligations (EU and UK customers, personal data in `incidents/incident-log.csv`). EU AI Act possibly relevant (AI dispute email feature). NIS 2: not sure. | `README.md` lines 5, 9, 12 |
| Next deadline | ISO 27001 certification audit targeted within six months (around April 2027). Two enterprise prospects waiting on certification. | `README.md` lines 9 and 10 |
| Who does the work, hours a week | No security or compliance hire; CTO sponsors. **Assumption: 8 hours a week** from one part-time owner. | `README.md` line 5; hours not stated |

## Artefacts

File dates are all 2026-10-19 (the date of the copy), so they say nothing about approval. Where a document has no date in its own control block, it is marked undated.

| Path | Type | Version | Approval or next review | Named owner | Seems to serve |
|---|---|---|---|---|---|
| `README.md` | Company context | none | undated | none | context |
| `policies/information-security-policy.md` | Top-level policy | 1.0 | Approved by CEO "at the founding board meeting"; next review "12 months after approval". README says written about two years ago, never reviewed. Undated. | Head of Engineering (role vacant per access control policy) | ISO 27001 |
| `policies/access-control-policy.md` | Topic policy | 1.0 | none, undated | Head of Engineering, "role vacant since the last reorganisation" | ISO 27001 |
| `policies/incident-response-plan.md` | Plan | "Draft" | none, undated | CTO | ISO 27001, GDPR breach handling |
| `registers/risk-register.csv` | Risk register, 8 rows | none | every row "last reviewed Q1 last year" | 5 of 8 rows owned; R2, R5, R7 blank | ISO 27001 |
| `registers/asset-inventory.csv` | Asset inventory, 6 rows | none | undated | 5 of 6 owned; legacy reporting server blank | ISO 27001 |
| `registers/vendors.csv` | Vendor list, 6 rows | none | undated | no owner column | ISO 27001, GDPR processors |
| `registers/statement-of-applicability.csv` | Statement of applicability, 8 rows | none | undated | no owner column | ISO 27001 |
| `incidents/incident-log.csv` | Incident log, 2 rows | none | entries "Spring last year", "Autumn last year" | none | ISO 27001, GDPR |
| `evidence/README.md` | Evidence index | none | undated | none | ISO 27001 |

## Could not see

- The evidence itself: the single sign-on screenshot and the backup configuration export listed in `evidence/README.md` are not in `evidence/`.
- Cloud provider console and backup settings (`registers/asset-inventory.csv`, `evidence/README.md`).
- Identity provider and multi-factor settings (`policies/access-control-policy.md`).
- Ticketing system used for production access approvals (`policies/access-control-policy.md`).
- The `#incidents` chat channel and on-call rota (`policies/incident-response-plan.md`, `policies/information-security-policy.md`).
- Code hosting SaaS and CI secrets (`registers/vendors.csv`, risk R8).
- Contracts, data processing agreements and AI model API terms (`registers/vendors.csv`).
- CRM, payroll and email delivery tenants (`registers/vendors.csv`).
- HR leaver records and training completion records (`policies/access-control-policy.md`, `evidence/README.md`).
- Legacy reporting server in the office rack (`registers/asset-inventory.csv`).
- Customer-facing privacy notice, customer contracts and any security questionnaires already answered (`README.md`).
- Any secret or configuration file: none opened, by rule.
