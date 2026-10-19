# Top 10 skills for Quillfield

Drafted 2026-10-19 from grcskills `v2026.10.19`, for a human to review and sign. This skill drafts for a human to review and sign; this skill never marks a control effective.

Scoring: impact 3 closes a gap that blocks the next audit, a deal or a legal deadline; 2 removes recurring work or a known weakness; 1 is hygiene. Effort S fits in a morning, M needs two or three people, L needs new decisions or a new process. Sorted by impact, then effort, then deadline. The deadline is the ISO 27001 certification audit targeted within six months (`README.md` line 10). Every skill below scored impact 3, because almost every gap found blocks that audit.

| Rank | Skill | Impact | Effort | Why | First action |
|---|---|---|---|---|---|
| 1 | `scope-statement-drafting` | 3 | S | There is no scope statement anywhere in the folder, and the statement of applicability excludes physical controls "because we are fully remote" while `registers/asset-inventory.csv` lists an office rack. The boundary has to be decided before anything else. | CTO drafts the scope boundary (product, EU cloud region, office rack in or out) in one session. |
| 2 | `risk-method-drafting` | 3 | S | `registers/risk-register.csv` uses 1 to 5 scales with no written meaning, no acceptance threshold and no rule for who may accept (R4 shows "Accepted" with no approver). | Draft likelihood and impact anchors and an acceptance rule; CEO signs. |
| 3 | `control-owner-raci` | 3 | S | The Head of Engineering role is vacant (`policies/access-control-policy.md` line 3), yet it owns the information security policy, the security programme, the invoice processing service, risk R6 and receives incident reports. | Name one accountable role for each orphaned item. |
| 4 | `risk-register-hygiene-review` | 3 | S | The register was last reviewed "Q1 last year", although the policy promises a quarterly review. R2, R5 and R7 have no owner, and R3 and R6 are the same phishing risk (`registers/risk-register.csv`). | Run the review on the register once the method from rank 2 exists. |
| 5 | `internal-audit-programme-planning` | 3 | M | Nobody has ever run an internal audit (`README.md` line 10), and a full cycle has to finish before the certification audit. This is the longest lead time in the plan. | Decide who audits (an outside contractor or a trained colleague who is not auditing their own work) and book the window. |
| 6 | `first-gap-assessment` | 3 | M | The six-month target has no baseline yet. Only 8 statement of applicability rows exist, and the missing items in `audit.md` need confirming against the standard. | Baseline the folder against ISO 27001 and size each gap. |
| 7 | `incident-response-plan-drafting` | 3 | M | The plan is a "Draft" with "to do: severity levels, who decides about customer and regulator notification". Both incidents in `incidents/incident-log.csv` have severity "Not set", and one involved personal data with no notification decision recorded. | Draft severity levels, a notification decision owner and a contact list. |
| 8 | `ai-vendor-due-diligence` | 3 | M | The AI model API receives invoice line items and supplier names under "click-through terms" with no data processing agreement, no security review and a US region (`registers/vendors.csv` row 6). This is a likely GDPR gap, and prospects will ask about it. | Collect the provider's terms, data processing agreement and training-on-data position. |
| 9 | `policy-review-cycle-refresh` | 3 | M | The policy set was "written two years ago from a template and has not been reviewed since" (`README.md` line 11), past its own 12-month cycle (`policies/information-security-policy.md` line 3), and it names a vacant owner. | List what changed since approval: the AI feature, the reorganisation and both incidents. |
| 10 | `soa-first-draft` | 3 | L | `registers/statement-of-applicability.csv` has 8 rows, several marked "Implemented" with no evidence or a draft as evidence. It needs the risk treatment decisions from ranks 2 and 4 first, so it starts after day 30. | After the risk work, draft one row per control with a risk or obligation behind it. |

## Next in line (not ranked)

- `customer-security-questionnaire-answers` (impact 2, S): sales loses time on questionnaires (`README.md` line 9). It will draw on the documents above, so run it after ranks 3, 7 and 9 to avoid giving answers the current material cannot support.
- `soa-status-reconciliation` (impact 3, S): a quick fix for "Implemented" claims without records. It is folded into rank 10 rather than ranked separately.
- `transfer-impact-assessment`, `ropa-first-draft`, `vendor-tiering`: four US vendors handle personal data or secrets (`registers/vendors.csv`). These are GDPR items to confirm and schedule in days 31 to 60.
- `ai-system-inventory`, `ai-act-risk-classification`: the dispute email feature (`README.md` line 12). Lower priority because it does not block the ISO 27001 audit.
- `nis2-entity-applicability-check`: NIS 2 scope is "not sure" for a 42-person SaaS company. One quick check will settle it.
