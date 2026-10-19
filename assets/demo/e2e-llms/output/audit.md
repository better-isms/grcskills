# Audit: broken, duplicated, missing

Draft for review. One line per finding: type, path, what is wrong, the skill that fixes it. This skill drafts for a human to review and sign; this skill never marks a control effective. Nothing here says a requirement is met or a control works.

## Broken

| Type | Path | What is wrong | Skill that fixes it |
|---|---|---|---|
| Past review | `policies/information-security-policy.md` | The policy sets a 12-month review, but README says it was written two years ago and never reviewed | policy-review-cycle-refresh |
| Ownerless | `policies/information-security-policy.md`, `policies/access-control-policy.md` | Both name the Head of Engineering as owner; that role is vacant (stated in the access control policy) | policy-review-cycle-refresh, control-owner-raci |
| Contradiction | `policies/information-security-policy.md` vs `policies/access-control-policy.md` | One limits production access to engineers on the on-call rota; the other grants it to anyone with a ticket approved by a team lead | policy-review-cycle-refresh, document-consistency-check |
| Contradiction | `policies/information-security-policy.md` vs `policies/incident-response-plan.md` | One says report incidents to the Head of Engineering (vacant) within 24 hours; the other says post in #incidents and let the on-call engineer decide, with no deadline | incident-response-plan-drafting |
| Not practised | `policies/access-control-policy.md` vs `evidence/README.md` | The policy promises quarterly access reviews with records; the evidence index says none were collected | access-review-campaign-prep |
| Weak exception | `policies/access-control-policy.md`, `registers/asset-inventory.csv` | Shared admin login on the legacy reporting server, which has no asset owner, no retirement date and no risk entry | risk-register-hygiene-review, risk-acceptance-memo |
| Stale review | `registers/risk-register.csv` | All 8 rows last reviewed "Q1 last year"; the policy commits to quarterly reviews | risk-register-hygiene-review |
| Ownerless | `registers/risk-register.csv` | R2, R5 and R7 have no owner; R2 and R7 have no treatment | risk-register-hygiene-review |
| Unrecorded acceptance | `registers/risk-register.csv` | R4 has status "Accepted" (score 10) but no record of who accepted it, when or against what threshold | risk-acceptance-memo, risk-method-drafting |
| Unsupported status | `registers/statement-of-applicability.csv` | A.5.19 is marked "Implemented" with no justification or evidence, and no vendor has a security review (`registers/vendors.csv`) | soa-status-reconciliation |
| Unsupported status | `registers/statement-of-applicability.csv` | A.8.13 is marked "Implemented" ("Cloud backups") but no restore test exists (`evidence/README.md`) | backup-restore-test-evidence |
| Unsupported status | `registers/statement-of-applicability.csv` | A.5.24 is marked "Implemented" but points to a plan that is still a draft | incident-response-plan-drafting, soa-status-reconciliation |
| Contradiction | `registers/statement-of-applicability.csv` vs `registers/asset-inventory.csv` | A.7.4 excluded because "we are fully remote", while the asset list has an office rack and laptops "in staff homes and office" | soa-exclusion-justification-review |
| Not severity-rated | `incidents/incident-log.csv` | Both incidents have severity "Not set"; there is no severity scale anywhere | incident-severity-triage |
| Missing decision | `incidents/incident-log.csv` | A customer export with personal data went to the wrong customer, marked "Notified: No", with no recorded assessment of whether notification was needed. Check the GDPR breach documentation duty (Art. 33(5)) against the official text (**to confirm**) | regulatory-incident-reporting-clock, post-incident-review |
| No review | `incidents/incident-log.csv` | A 5-hour production outage has no post-incident review and no follow-up actions | post-incident-review |
| Stale evidence | `evidence/README.md` | The SSO screenshot was "taken at setup, not refreshed since"; the listed evidence files are not in the folder at all | evidence-freshness-check |
| Vendor gap | `registers/vendors.csv` | No security review on file for any of the 6 vendors | vendor-tiering, vendor-security-questionnaire-triage |
| Vendor gap | `registers/vendors.csv` | Code hosting holds source code and CI secrets, with no DPA; the CRM's DPA is "Unknown" | dpa-security-annex-review |
| Vendor gap | `registers/vendors.csv` | The AI model API gets invoice line items and supplier names, US-hosted, on click-through terms, no DPA. Check the GDPR processor contract duty (Art. 28) and transfer rules (Chapter V) (**to confirm**) | ai-vendor-due-diligence, transfer-impact-assessment |
| Mismatch | `registers/asset-inventory.csv` vs `registers/vendors.csv` | The AI model API, email delivery service and payroll provider are vendors but not assets; the inventory has no AI system | ai-system-inventory |

## Duplicated

| Type | Path | What is wrong | Skill that fixes it |
|---|---|---|---|
| Duplicate risk | `registers/risk-register.csv` | R3 "Phishing" (score 12, treated by training) and R6 "Phishing emails lead to credential theft" (score 16, treated by MFA) are the same threat scored twice by different owners | risk-register-hygiene-review |
| Drifted restatement | `policies/information-security-policy.md`, `policies/access-control-policy.md`, `policies/incident-response-plan.md` | Production access and incident reporting rules each appear in two documents and have drifted apart (see Broken) | document-consistency-check |

## Missing

Nothing in this section was confirmed against official text or a framework lookup in this run. Everything is **to confirm**, and the list is limited to what ISO 27001 certification within six months and GDPR need for this company.

| Type | Path | What is wrong | Skill that fixes it |
|---|---|---|---|
| Missing (to confirm) | none | No scope statement for the management system | scope-statement-drafting |
| Missing (to confirm) | none | No risk assessment method: no likelihood and impact criteria, no acceptance criteria | risk-method-drafting |
| Missing (to confirm) | none | No risk treatment plan linking risks to controls and owners | risk-treatment-plan-drafting, risk-to-control-traceability-check |
| Missing (to confirm) | `registers/statement-of-applicability.csv` | The statement of applicability covers 8 controls; a complete one covers the whole reference control set, each with a justification | soa-first-draft |
| Missing (to confirm) | none | No internal audit programme and no internal audit run yet (`README.md`) | internal-audit-programme-planning, internal-audit-checklist-from-scope |
| Missing (to confirm) | `evidence/README.md` | No management review minutes | management-review-pack |
| Missing (to confirm) | `evidence/README.md` | No training completion records; annual training is promised in the information security policy | evidence-request-list-builder |
| Missing (to confirm) | none | No record of processing activities, though there is customer, prospect and employee personal data | ropa-first-draft |
| Missing (to confirm) | none | No DPIA screening for the AI dispute-email feature | dpia-screening |
| Missing (to confirm) | none | No AI system inventory or use rules for the shipped AI feature; EU AI Act category not assessed | ai-system-inventory, ai-act-risk-classification |
| Missing (to confirm) | none | No business continuity or recovery plan; R4 (region outage) is accepted with no plan behind it | business-impact-analysis |
| Missing (to confirm) | none | No acceptable use policy for staff laptops and SaaS | acceptable-use-policy-drafting |
