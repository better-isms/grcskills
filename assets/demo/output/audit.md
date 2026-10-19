# Audit: broken, duplicated, missing

Drafted 2026-10-19 for a human to review and sign. This skill drafts for a human to review and sign; this skill never marks a control effective. Statuses below describe the documents, not whether any control works.

## Broken

| Type | Path | What is wrong | Skill that fixes it |
|---|---|---|---|
| Broken: overdue | `policies/information-security-policy.md` | Its own cycle is 12 months after approval. README says it was written about two years ago and never reviewed. | `policy-review-cycle-refresh` |
| Broken: ownerless | `policies/information-security-policy.md`, `policies/access-control-policy.md` | Owner is the Head of Engineering, a role the access control policy says has been vacant since the reorganisation. | `control-owner-raci` |
| Broken: ownerless | `registers/asset-inventory.csv` | "Invoice processing service" is owned by the vacant Head of Engineering. "Legacy reporting server" has no owner. | `control-owner-raci` |
| Broken: ownerless | `registers/risk-register.csv` | R2, R5, R7 have no owner. R6 is owned by the vacant role. R2 and R7 have no treatment. | `risk-register-hygiene-review` |
| Broken: overdue | `registers/risk-register.csv` | Every row was last reviewed "Q1 last year", but the information security policy promises a quarterly review. | `risk-register-hygiene-review` |
| Broken: no method | `registers/risk-register.csv` | The 1 to 5 scales have no anchors and there is no acceptance threshold. R4 is "Accepted" with no approver or date. | `risk-method-drafting`, then `risk-acceptance-memo` |
| Broken: contradiction | `registers/statement-of-applicability.csv` vs `registers/asset-inventory.csv` | A.7.4 is excluded as "We are fully remote", but the asset inventory lists a server in an "Office rack" and laptops in the "office". | `scope-statement-drafting`, `soa-exclusion-justification-review` |
| Broken: claim without records | `registers/statement-of-applicability.csv` | A.5.24 is "Implemented", but its evidence is a plan marked "Draft". | `soa-status-reconciliation` |
| Broken: claim without records | `registers/statement-of-applicability.csv` vs `registers/vendors.csv` | A.5.19 is "Implemented" with no justification or evidence, while every vendor shows "None on file" for security review. | `soa-status-reconciliation`, `vendor-tiering` |
| Broken: claim without records | `registers/statement-of-applicability.csv` vs `evidence/README.md` | A.5.15 is "Implemented", but no access review records exist. A.8.13 is "Implemented", but no restore test results exist. | `access-review-campaign-prep`, `backup-restore-test-evidence` |
| Broken: policy vs practice | `policies/access-control-policy.md` vs `evidence/README.md` | The policy says team leads review access every quarter and keep a record. The evidence index says none has been collected. | `policy-gap-review-against-practice`, `access-review-campaign-prep` |
| Broken: open exception | `policies/access-control-policy.md` line 11 | "Shared accounts are not allowed", but the legacy reporting server has a shared admin login with no end date and no owner. | `risk-acceptance-memo` |
| Broken: incomplete plan | `policies/incident-response-plan.md` | Marked "Draft". Severity levels, the notification decision owner and the contact list are all "to do". | `incident-response-plan-drafting` |
| Broken: incomplete log | `incidents/incident-log.csv` | Both entries have severity "Not set". The misdirected customer export involved personal data, "notified: No", and no breach assessment or notification decision is recorded. | `regulatory-incident-reporting-clock` (to record the decision), `incident-severity-triage` |
| Broken: no review | `incidents/incident-log.csv` row 2 | A 5-hour production outage has no post-incident review. | `post-incident-review` |
| Broken: stale or missing evidence | `evidence/README.md` | The single sign-on screenshot is "not refreshed since" setup. Training has "no completion records". The listed screenshot and export files are not in `evidence/`. | `evidence-freshness-check` |
| Broken: vendor gaps | `registers/vendors.csv` | Code hosting has "DPA signed: No" and holds secrets in CI. CRM shows DPA "Unknown". The AI model API runs on click-through terms with no DPA. No vendor has a security review. | `ai-vendor-due-diligence`, `dpa-security-annex-review`, `vendor-tiering` |

## Duplicated

| Type | Path | What is wrong | Skill that fixes it |
|---|---|---|---|
| Duplicated | `registers/risk-register.csv` R3 and R6 | Two phishing risks, with different owners, scores (12 and 16) and treatments. | `risk-register-hygiene-review` |
| Duplicated and drifted | `policies/information-security-policy.md` vs `policies/incident-response-plan.md` | The policy says incidents go to the Head of Engineering (vacant) within 24 hours. The plan says post in `#incidents` and let the on-call engineer decide. These are two different reporting routes. | `document-consistency-check`, `incident-response-plan-drafting` |
| Duplicated and drifted | `policies/information-security-policy.md` vs `policies/access-control-policy.md` | One says production access is "limited to engineers on the on-call rota". The other says it is "granted through a ticket approved by the team lead". These are two different rules. | `document-consistency-check` |

## Missing (all to confirm)

The framework lookup connection was not available, and the official text was not checked in this run. Confirm each item against ISO 27001 or the GDPR text before acting on it.

| Type | Path | What is wrong | Skill that fixes it |
|---|---|---|---|
| Missing, to confirm | (none) | No scope statement for the management system. | `scope-statement-drafting` |
| Missing, to confirm | (none) | No written risk assessment method or acceptance criteria. | `risk-method-drafting` |
| Missing, to confirm | (none) | No risk treatment plan; the register's treatment column holds one word per risk. | `risk-treatment-plan-drafting` |
| Missing, to confirm | `registers/statement-of-applicability.csv` | It covers 8 controls rather than the full control set, with no justification for the rest. | `soa-first-draft` |
| Missing, to confirm | (none) | No internal audit programme or results (`README.md` line 10). | `internal-audit-programme-planning` |
| Missing, to confirm | `evidence/README.md` | No management review minutes. | `management-review-pack` |
| Missing, to confirm | (none) | No security objectives document. | `first-gap-assessment` |
| Missing, to confirm | `evidence/README.md` | No training completion records. | `evidence-freshness-check` |
| Missing, to confirm (GDPR) | (none) | No record of processing activities, although customer, prospect and employee personal data flows to six vendors. | `ropa-first-draft` |
| Missing, to confirm (GDPR) | `registers/vendors.csv` | No transfer assessments for the four US vendors that receive personal data. | `transfer-impact-assessment` |
| Missing, to confirm (GDPR) | `registers/vendors.csv` | No processor contract for the AI model API and code hosting. The CRM status is unknown. | `ai-vendor-due-diligence`, `dpa-security-annex-review` |
| Missing, to confirm (EU AI Act) | `registers/asset-inventory.csv` | The AI dispute email feature is not in any inventory or risk. | `ai-system-inventory`, `ai-act-risk-classification` |
| Missing, to confirm | (none) | No continuity or recovery plan, although R4 (region outage) is accepted and backups are the only treatment for R1. | `business-impact-analysis` |
