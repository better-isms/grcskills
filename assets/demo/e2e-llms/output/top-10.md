# Top 10 skills for Quillfield

Draft for review. This skill drafts for a human to review and sign; this skill never marks a control effective.

How it is scored. **Impact**: 3 means it blocks the certification audit (about six months away) or a legal duty, 2 means it removes recurring manual work or a known weakness, 1 is hygiene. **Effort**: S fits in a morning, M needs two or three people, L needs new decisions or a new process. Sorted by impact, then effort, then which item unblocks others. No category has more than two entries.

| Rank | Skill | Impact | Effort | Why (cited) | First action |
|---|---|---|---|---|---|
| 1 | scope-statement-drafting | 3 | S | There is no scope statement. The only scope text is "all employees, contractors, systems and data" (`policies/information-security-policy.md`), and the asset list includes an office rack and home laptops (`registers/asset-inventory.csv`). Every other artefact depends on where the boundary sits. | CTO decides whether the legacy reporting server and the office are in scope |
| 2 | risk-register-hygiene-review | 3 | S | Every row was last reviewed "Q1 last year", although the policy promises a quarterly review. R2, R5 and R7 have no owner, and R3 and R6 are both phishing (`registers/risk-register.csv`). | Run it on the existing CSV and write the corrected copy alongside it |
| 3 | risk-method-drafting | 3 | M | Rows have 1 to 5 scores with no criteria, no acceptance threshold and no record of who accepted R4 (`registers/risk-register.csv`). A certification audit checks the method before it checks the register. | CEO and CTO agree a risk acceptance threshold and who may accept |
| 4 | soa-first-draft | 3 | M | The statement of applicability has 8 rows. Five are marked "Implemented" with no evidence or a missing justification (A.5.19, A.8.13), and A.7.4 is excluded as "fully remote" while an office rack exists (`registers/statement-of-applicability.csv`, `registers/asset-inventory.csv`). | Rebuild it from scope (rank 1) and the cleaned register (rank 2) |
| 5 | incident-response-plan-drafting | 3 | M | The plan is a draft with no severity levels and no rule for notifying customers or regulators (`policies/incident-response-plan.md`). A misdirected customer export involving personal data was never assessed for notification (`incidents/incident-log.csv`). | Add a severity scale and the decision on notifying regulators and customers; record the decision on the spring incident |
| 6 | ai-vendor-due-diligence | 3 | M | The AI model API receives invoice line items and supplier names in the US on click-through terms, with no DPA and no security review (`registers/vendors.csv`, `README.md`). | List what data the dispute-email feature sends, then review the provider's terms |
| 7 | internal-audit-programme-planning | 3 | M | "Nobody has run an internal audit yet" (`README.md`), and one has to finish before the certification audit. It takes a long time to set up, so it needs to start now. | Fix the audit dates and pick an auditor who does not audit their own work |
| 8 | policy-review-cycle-refresh | 3 | M | The policies are two years old and were never reviewed (`README.md`). Both policies name a vacant role as owner, and they contradict each other on who gets production access (`policies/information-security-policy.md`, `policies/access-control-policy.md`). | CEO names an interim security owner; refresh these two policies first |
| 9 | vendor-tiering | 2 | S | None of the six vendors has a security review on file. Code hosting holds CI secrets with no DPA, and the CRM's DPA status is "Unknown" (`registers/vendors.csv`). Tiering shows which vendors to review first. | Tier the six vendors by the data they hold and how much the service depends on them |
| 10 | customer-security-questionnaire-answers | 2 | M | "Sales keeps losing time on customer security questionnaires" (`README.md`). A reusable answer bank built from the refreshed policies stops that drain. | Head of Sales collects the last three questionnaires received |

## Close calls (11 to 15)

- **document-consistency-check** (2, S): the two policies and the plan give three different incident reporting routes. Rank 8 covers most of this.
- **dpia-screening** (3, S, to confirm): the AI feature processes supplier and contact data in a new way. Run it alongside rank 6 if the screening says it is needed.
- **management-review-pack** (3, M): needed before certification, and no minutes exist (`evidence/README.md`). It is scheduled in week 1 of the plan, but the pack itself is due after day 30.
- **access-review-campaign-prep** (2, M): the policy promises quarterly access reviews, but no records exist (`policies/access-control-policy.md`, `evidence/README.md`).
- **backup-restore-test-evidence** (2, S): A.8.13 is marked "Implemented", but no restore test has been done (`evidence/README.md`).
