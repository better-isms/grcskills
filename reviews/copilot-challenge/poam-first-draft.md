# Copilot challenge: poam-first-draft

- Date: 2026-10-27
- Conversation: d810629a-7f59-49ab-af5f-7603eb17c3cf (ISMS Copilot, mode think, answer_format decision, message 31997bd9-8197-4161-ba7e-1b73044f08d4)
- Verdicts: Q1 PASS, Q2 FIX, Q3 FIX (fixed below)

## Fixes applied

1. Known exploited vulnerabilities: the catalogue's timelines bind federal civilian agencies only; everyone else treats a match as the top priority within their own window. Copilot cited BOD 22-01; CISA's site shows it was revoked and superseded by BOD 26-04, so the skill names "the CISA binding operational directive in force" instead of a number.
2. CMMC dates come from the assessment timeline, not the organization's remediation window: the closeout assessment falls within 180 days of the conditional status date.
3. Step 5 gives the operative CMMC Level 2 limits from 32 CFR 170.21 (after Codex round 1, finding 3): conditional status at a score ratio of at least 0.8; open items worth 1 point only, except the encryption case; the six requirements never on the plan, by bare id only; closeout assessment within 180 days of the conditional status date.
4. CMMC rows carry the requirement's point value so the score with open items can be computed.
5. One status list (open, in progress, completed pending verification, closed with the verification record id, risk accepted with the decision reference).
6. Each row links to the system security plan statement it affects.
7. Review sorts by risk, then detection date.
8. Codex round 1, finding 2: an item with no plan stays on the plan as incomplete and escalated, with a request to the official, and leaves only after a recorded acceptance. For CMMC, a risk acceptance never turns a not met requirement into met (32 CFR 170.24).

## Fixes declined

- The 5, 3 and 1 point values per requirement: the skill asks for a point value column and names 32 CFR 170.24; the six never-eligible ids are now listed (reversed after Codex round 1).
- Separate branches for reporting into agency or DoD systems of record: those are tools, not practice; the skill stays tool-neutral.
- A claim that new CMMC designations were limited to self-assessments after a suspension: could not verify it against official text, and it is time-bound; not used.
- Severity normalisation across sources: kept as the original-versus-adjusted rating with evidence.

## Citations

- Verified against the official text (eCFR, 32 CFR 170.21, fetched 2026-10-27): plan of action only when the score ratio is at least 0.8; no open item above 1 point except the non-validated encryption case; six requirements never on a plan, including the system security plan; closeout assessment within 180 days of the conditional status date.
- Verified on cisa.gov (fetched 2026-10-27): BOD 22-01 is marked revoked and superseded by BOD 26-04; the KEV catalogue continues.
- No control wording is quoted or paraphrased; ids appear bare.

## Verified (independent review round 1, 2026-10-27)

- 32 CFR 170.21 (eCFR API, fetched 2026-10-27): score ratio at least 0.8; no open item above 1 point except SC.L2-3.13.11 when encryption is used but not FIPS-validated; never on a plan of action: AC.L2-3.1.20, AC.L2-3.1.22, CA.L2-3.12.4, PE.L2-3.10.3, PE.L2-3.10.4, PE.L2-3.10.5; closeout assessment within 180 days of the conditional status date.
- 32 CFR 170.24 (eCFR API, fetched 2026-10-27): a plan of action addressing a not met requirement is not a substitute for a completed requirement; requirements not implemented are not met whether or not they are on a plan. The section has no risk acceptance provision.
