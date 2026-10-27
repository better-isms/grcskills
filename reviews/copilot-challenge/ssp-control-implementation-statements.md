# Copilot challenge: ssp-control-implementation-statements

- Date: 2026-10-27
- Conversation: 58849f7e-d587-4bb8-a1eb-5ad1de0555c5 (ISMS Copilot, mode think, answer_format decision, message 53626bad-9c6c-4b1f-81b7-bef694d2f7a9)
- Verdicts: Q1 PASS, Q2 FIX, Q3 FIX (fixed below)

## Fixes applied

1. Copilot's fix (no "inherited" for SP 800-171 and CMMC) was applied, then reversed after the independent review (Codex round 1, finding 1): the official CMMC Assessment Process contradicts it, and the official text wins. The skill now uses four origination values for every framework: inherited, hybrid, system-specific, and undetermined (a provider plays a part but no document shows the split yet; it stays there until the split is evidenced, never hybrid by default). For CMMC it says assessors check the provider's responsibility matrix, test the inheritance claims and confirm a FedRAMP Moderate cloud offering on the marketplace (CAP sections 2.17 to 2.21).
2. Revision: CMMC Level 2 assesses against SP 800-171 Rev. 2 with SP 800-171A as the source of assessment objectives (32 CFR 170.14); a request for another revision is flagged.
3. CMMC statuses: met or not met (32 CFR 170.24); planned and claimed count as not met; an objective marked not applicable counts as met, so the fact behind it is recorded.
4. SP 800-53 enhancements get their own rows; SP 800-171 ids are flat. The baseline and tailoring used are written at the top of `statements.md`.
5. Each statement is checked against the assessment objectives for its id (SP 800-53A or SP 800-171A), with unanswered objectives listed.
6. Hybrid rows record which side of the split sets each parameter value.
7. Not applicable in SP 800-53 rests on the tailoring decision; alternative implementation records the written justification.
8. Implemented means evidence fit for the assessment objective: a configuration export, an examined document, a test result, or a record dated within its frequency where the control recurs (Codex round 2, finding 3, replacing the earlier "dated record for every control").
9. The plan itself is marked and stored under the organization's rules for sensitive documents.

## Fixes declined

- Hardcoding CMMC point values, the six never-deferrable requirement ids and partial-credit cases into this skill: they belong to the plan of action skill (which names the rule) and to a framework lookup; listing them here would push the spine past the word limit.
- An asset-category column for CMMC scoping: scoping is a separate job; the skill uses the boundary and categorization it is given.
- An update trigger for future changes to the CMMC scoring method: covered by the framework lookup.

## Citations

- Verified against the official text (eCFR, 32 CFR Part 170, fetched 2026-10-27): 170.14(c)(3), Level 2 requirements are identical to SP 800-171 R2; 170.14(d), assessment per SP 800-171A Jun2018; 170.21, plan of action limits (minimum score ratio 0.8, no open item above 1 point except the encryption case, six requirements never on a plan, closeout within 180 days).
- Verified against the official text (eCFR, 48 CFR 252.204-7012, fetched 2026-10-27): (b)(2)(ii)(D), cloud providers holding covered defense information meet security equivalent to the FedRAMP Moderate baseline.
- No control wording is quoted or paraphrased; ids appear bare.

## Verified (independent review round 1, 2026-10-27)

- CMMC Assessment Process v2.0 (cyberab.org PDF, text extracted and read): 2.17, the assessment team checks the provider's customer responsibility matrix is current and covers all in-scope requirements performed wholly, partially or jointly by the provider; 2.18, interview of provider staff, plus examine and test methods on the inheritance claims in the matrix; 2.19, a provider holding its own CMMC certificate means less effort, and inherited requirements are still confirmed as maintained; 2.20 and 2.21, FedRAMP Moderate offerings confirmed on the FedRAMP Marketplace, or equivalency per DoD CIO policy. Copilot's "no inheritance under CMMC" is contradicted and was removed.
- 32 CFR 170.24 (eCFR API, fetched 2026-10-27): met and not met findings; a plan of action is no substitute for a completed requirement; an objective assessed not applicable is equivalent to met; 5, 3 and 1 point values.

## Verified (independent review round 2, 2026-10-27)

- CMMC Assessment Process v2.0 (cyberab.org PDF, text read): 2.20, a FedRAMP Moderate authorization is confirmed on the FedRAMP Marketplace; 2.21 and 2.21.1, a cloud offering not FedRAMP authorized can meet the FedRAMP Moderate equivalency, and the assessment team checks that its body of evidence is complete, intact and within its periodicity. The skill now names both paths (Codex round 2, finding 1).
- DFARS 252.204-7012 (b)(2)(ii)(D) (eCFR API, read in round 1): the cloud check applies to a provider that stores, processes or transmits covered defense information; the skill limits it to offerings that store, process or transmit CUI.
- CMMC Assessment Process v2.0, 2.6: assessors use the three methods of examine, interview and test as outlined in SP 800-171A. The skill no longer demands a dated recurring record for every control (Codex round 2, finding 3). The csrc.nist.gov landing pages for SP 800-53A Rev. 5 and SP 800-171A do not name the methods in their abstracts; the CAP text is the source used.
- 32 CFR 170.24 (eCFR API, read in round 1): findings are met, not met or not applicable, and an objective assessed not applicable is equivalent to met. The skill states all three (Codex round 2, finding 4).
