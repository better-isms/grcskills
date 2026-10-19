# 30-day plan (2026-10-19 to 2026-11-17)

Draft for review. This skill drafts for a human to review and sign; this skill never marks a control effective.

**Capacity assumed: about 8 hours a week** (CTO plus one engineer), so about 32 hours in total. This was not confirmed. If you have less time, cut from the bottom of week 4 first. Item 12 uses Sales' hours, not this budget.

Skill outputs are drafts written next to the originals. Nobody changes the existing files until the owner has reviewed the draft.

## Week 1 (Oct 19 to 23): unblock, and start the long-lead items, about 8 h

| # | Item | Owner role | Skill | Produces | Done when |
|---|---|---|---|---|---|
| 1 | Name an interim security owner to replace the vacant Head of Engineering | CEO | none (a decision) | A one-line decision recorded in `policies/` or in board notes | A named role owns the policy set and the risk register |
| 2 | Draft the scope statement | CTO | scope-statement-drafting | The scope statement file the skill names | The CTO has signed off scope, including whether the legacy server and the office are in or out |
| 3 | Clean the risk register | Interim security owner | risk-register-hygiene-review | Reviewed copy of `registers/risk-register.csv` with findings | Every row has an owner and a review date; R3 and R6 are merged; R4 is flagged for a memo |
| 4 | Plan the internal audit and book the management review (these run past day 30) | Interim security owner | internal-audit-programme-planning | Internal audit programme file | The audit dates and the auditor are in the calendar; the management review date is booked before the certification audit |

## Week 2 (Oct 26 to 30): method and incidents, about 8 h

| # | Item | Owner role | Skill | Produces | Done when |
|---|---|---|---|---|---|
| 5 | Draft the risk method | CTO with CEO | risk-method-drafting | Risk method document | The scoring criteria and the acceptance threshold are written down, and the register has been re-scored against them |
| 6 | Finish the incident response plan | CTO | incident-response-plan-drafting | Updated draft of `policies/incident-response-plan.md` | It has a severity scale, a named decision-maker for notifying customers and regulators, and a contact list; it no longer contradicts the information security policy |
| 7 | Record a decision on the spring personal-data incident | CTO with a privacy adviser | regulatory-incident-reporting-clock | Incident assessment note | The log has a severity and a written, dated decision on notification; a person decides, the skill does not |

## Week 3 (Nov 2 to 6): applicability and vendors, about 8 h

| # | Item | Owner role | Skill | Produces | Done when |
|---|---|---|---|---|---|
| 8 | Rebuild the statement of applicability | Interim security owner | soa-first-draft | New statement of applicability draft | It covers every reference control, each with a justification, and each status points at evidence or says "Planned"; A.7.4 is reconsidered |
| 9 | Tier the vendors | Interim security owner | vendor-tiering | Tiered vendor list | All 6 vendors are tiered; top-tier vendors have a review date and a DPA action |

## Week 4 (Nov 9 to 13, buffer to Nov 17): AI vendor and policies, about 8 h

| # | Item | Owner role | Skill | Produces | Done when |
|---|---|---|---|---|---|
| 10 | Due diligence on the AI model API | CTO | ai-vendor-due-diligence | AI vendor assessment | Data sent, terms, DPA status and transfer route are documented; the decision is with the CEO |
| 11 | Refresh the two policies | Interim security owner | policy-review-cycle-refresh | Refreshed drafts of the information security and access control policies | They name a real owner and a review date, and agree on production access; they are ready for CEO approval |
| 12 | Build the questionnaire answer bank (Sales' time, if they agree) | Head of Sales | customer-security-questionnaire-answers | Answer bank | The last three questionnaires are answered from it, and every answer cites a policy |

## Moved out of these 30 days

- **management-review-pack**: the date is booked in item 4; build the pack in the month before the review.
- **access-review-campaign-prep** and **backup-restore-test-evidence**: start in month 2. They feed the evidence an auditor will sample.
- **dpia-screening**, **ai-system-inventory**, **ropa-first-draft**: start after item 10, using what it finds.
- **post-incident-review** for the autumn outage, and **business-impact-analysis** for R4.
- The full timeline to the audit about six months out belongs to **first-gap-assessment**. Run it once items 2, 5 and 8 exist.
