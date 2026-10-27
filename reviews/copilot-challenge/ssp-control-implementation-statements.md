# Copilot challenge: ssp-control-implementation-statements

- Date: 2026-10-27
- Conversation: 58849f7e-d587-4bb8-a1eb-5ad1de0555c5 (ISMS Copilot, mode think, answer_format decision, message 53626bad-9c6c-4b1f-81b7-bef694d2f7a9)
- Verdicts: Q1 PASS, Q2 FIX, Q3 FIX (fixed below)

## Fixes applied

1. Inherited, hybrid and system-specific now apply to SP 800-53 systems only. For SP 800-171 and CMMC, a requirement a provider helps meet is marked "provider-operated, in scope" with the contract or responsibility matrix cited, and a cloud provider holding the data is checked against the FedRAMP Moderate equivalent in DFARS 252.204-7012. The NEVER rule says inherited is never used in an SP 800-171 or CMMC plan.
2. Revision: CMMC Level 2 assesses against SP 800-171 Rev. 2 with SP 800-171A as the source of assessment objectives (32 CFR 170.14); a request for another revision is flagged.
3. CMMC statuses: met or not met; planned and claimed both count as not met; not applicable needs the scoping record; only some requirements may sit on a plan of action (32 CFR 170.21).
4. SP 800-53 enhancements get their own rows; SP 800-171 ids are flat. The baseline and tailoring used are written at the top of `statements.md`.
5. Each statement is checked against the assessment objectives for its id (SP 800-53A or SP 800-171A), with unanswered objectives listed.
6. Hybrid rows record which side of the split sets each parameter value.
7. Not applicable in SP 800-53 rests on the tailoring decision; alternative implementation records the written justification.
8. "Current" defined: a record dated within the frequency its parameter sets.
9. The plan itself is marked and stored under the organization's rules for sensitive documents.

## Fixes declined

- Hardcoding CMMC point values, the six never-deferrable requirement ids and partial-credit cases into this skill: they belong to the plan of action skill (which names the rule) and to a framework lookup; listing them here would push the spine past the word limit.
- An asset-category column for CMMC scoping: scoping is a separate job; the skill uses the boundary and categorization it is given.
- An update trigger for future changes to the CMMC scoring method: covered by the framework lookup.

## Citations

- Verified against the official text (eCFR, 32 CFR Part 170, fetched 2026-10-27): 170.14(c)(3), Level 2 requirements are identical to SP 800-171 R2; 170.14(d), assessment per SP 800-171A Jun2018; 170.21, plan of action limits (minimum score ratio 0.8, no open item above 1 point except the encryption case, six requirements never on a plan, closeout within 180 days).
- Verified against the official text (eCFR, 48 CFR 252.204-7012, fetched 2026-10-27): (b)(2)(ii)(D), cloud providers holding covered defense information meet security equivalent to the FedRAMP Moderate baseline.
- No control wording is quoted or paraphrased; ids appear bare.
