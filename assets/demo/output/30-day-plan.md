# 30-day plan (2026-10-20 to 2026-11-18)

Drafted 2026-10-19 for a human to review and sign. This skill drafts for a human to review and sign; this skill never marks a control effective.

**Capacity assumption:** 8 hours a week from one part-time owner (32 hours in total), because `README.md` names no compliance hire. If the real figure differs, re-scale the plan. Every item produces a draft; the role named as owner reviews and signs it.

## Week 1: unblock (8 h)

| # | Item | Owner role | Skill | Produces | Done when | Hours |
|---|---|---|---|---|---|---|
| 1 | Reassign everything owned by the vacant Head of Engineering role, and the blank owners | CTO | `control-owner-raci` | `control-owner-raci.md` | Every policy, asset and risk row has one named accountable role, and the CEO has agreed the list | 2 |
| 2 | Draw the management system boundary, including the office rack question | CTO | `scope-statement-drafting` | `scope-statement.md` | Scope names products, locations, the cloud region, interfaces and justified exclusions, and is signed by the CEO | 2.5 |
| 3 | Write the risk method: scale anchors, acceptance threshold, who may accept | CTO with CEO | `risk-method-drafting` | `risk-method.md` | Anchors exist for every score 1 to 5, with an acceptance rule and a named approver role; CEO signed | 2.5 |
| 4 | Long-lead start: decide who runs the internal audit and book the window before the certification audit | CTO | `internal-audit-programme-planning` (first step) | decision note in `internal-audit-programme.md` | An auditor is named and is not auditing their own work, and the date is booked | 1 |

## Week 2: risk and baseline (8 h)

| # | Item | Owner role | Skill | Produces | Done when | Hours |
|---|---|---|---|---|---|---|
| 5 | Clean the risk register against the new method | Risk owners named in item 1 | `risk-register-hygiene-review` | `risk-register-review.md` | R3 and R6 are merged, every row has an owner and a treatment, and every row has been rescored with this quarter's date | 3 |
| 6 | Baseline ISO 27001 readiness, part 1, confirming the "to confirm" lines in `audit.md` | CTO | `first-gap-assessment` | `gap-assessment.md` (draft) | Every clause and control area is rated from evidence, and each "Missing, to confirm" line is confirmed or struck | 4 |
| 7 | Finish the internal audit programme | CTO | `internal-audit-programme-planning` | `internal-audit-programme.md` | Areas are ranked by risk, the first audit covers the full scope before the certification audit, and the CEO has approved it | 1 |

## Week 3: incidents and the overdue decision (8 h)

| # | Item | Owner role | Skill | Produces | Done when | Hours |
|---|---|---|---|---|---|---|
| 8 | Finish the gap assessment and size the six-month timeline | CTO | `first-gap-assessment` | `gap-assessment.md` (final draft) | Each gap has an effort size and a target month, and the timeline is reviewed by the CEO | 2 |
| 9 | Record the breach assessment and notification decision for the misdirected customer export | CTO with legal counsel | `regulatory-incident-reporting-clock` | entry note in `incidents/` | The facts, the regimes tested, the decision and the decision-maker are written down and signed. The skill drafts; counsel decides | 1 |
| 10 | Replace the draft incident plan: severity scale, notification decision owner, contacts, one reporting route | CTO | `incident-response-plan-drafting` | `incident-response-plan.md` (new draft) | Severity levels are defined, both log entries have been re-graded with them, the policy's 24-hour route and the plan's route agree, and the CEO has approved it | 5 |

## Week 4: AI vendor and policies (8 h)

| # | Item | Owner role | Skill | Produces | Done when | Hours |
|---|---|---|---|---|---|---|
| 11 | Assess the AI model API used for dispute emails | CTO with Head of Sales | `ai-vendor-due-diligence` | `ai-vendor-review.md` | Terms, data processing agreement status, training-on-data position, subprocessors and region are recorded, with a go, conditions or stop recommendation for the CEO | 3 |
| 12 | Refresh the information security and access control policies | Owners named in item 1 | `policy-review-cycle-refresh` | redlines of both policies | The access rule conflict is resolved, the shared login exception has an end date, version 1.1 is approved with a dated next review, and the change log is filled in | 5 |

## Moved out of the 30 days (did not fit 32 hours)

- `soa-first-draft` (ranked 10): needs the risk treatment decisions from items 3 and 5. Start in week 5, with `risk-treatment-plan-drafting` first.
- `customer-security-questionnaire-answers`: run once items 10 to 12 exist, so answers cite current documents.
- `vendor-tiering`, `transfer-impact-assessment`, `ropa-first-draft`, `dpa-security-annex-review`: GDPR vendor and processing work for days 31 to 60.
- `access-review-campaign-prep`, `backup-restore-test-evidence`, `evidence-freshness-check`: evidence for the "Implemented" claims. Schedule the first quarterly access review and a restore test in days 31 to 60 so records exist before the audit.
- `management-review-pack`: the first management review must come after the internal audit.

Re-run `grc-setup-review` at day 30 and compare its `inventory.md` with this one.
