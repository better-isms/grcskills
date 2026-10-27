# Copilot challenge: poam-first-draft

- Date: 2026-10-27
- Conversation: d810629a-7f59-49ab-af5f-7603eb17c3cf (ISMS Copilot, mode think, answer_format decision, message 31997bd9-8197-4161-ba7e-1b73044f08d4)
- Verdicts: Q1 PASS, Q2 FIX, Q3 FIX (fixed below)

## Fixes applied

1. Known exploited vulnerabilities: the catalogue's timelines bind federal civilian agencies only; everyone else treats a match as the top priority within their own window. Copilot cited BOD 22-01; CISA's site shows it was revoked and superseded by BOD 26-04, so the skill names "the CISA binding operational directive in force" instead of a number.
2. CMMC dates come from the assessment timeline, not the organization's remediation window: the closeout assessment falls within 180 days of the conditional status date.
3. Step 5 names what the CMMC rule (32 CFR 170.21) decides: a minimum score, a cap on the point value of open items, a short list of requirements never deferred (the system security plan is one), and the 180-day closeout.
4. CMMC rows carry the requirement's point value so the score with open items can be computed.
5. One status list (open, in progress, completed pending verification, closed with the verification record id, risk accepted with the decision reference).
6. Each row links to the system security plan statement it affects.
7. Review sorts by risk, then detection date.

## Fixes declined

- Listing the six never-deferrable CMMC requirement ids and the 5, 3, 1 point values in the skill: the rule is named and a lookup is required; ids would date the skill when the rule changes.
- Separate branches for reporting into agency or DoD systems of record: those are tools, not practice; the skill stays tool-neutral.
- A claim that new CMMC designations were limited to self-assessments after a suspension: could not verify it against official text, and it is time-bound; not used.
- Severity normalisation across sources: kept as the original-versus-adjusted rating with evidence.

## Citations

- Verified against the official text (eCFR, 32 CFR 170.21, fetched 2026-10-27): plan of action only when the score ratio is at least 0.8; no open item above 1 point except the non-validated encryption case; six requirements never on a plan, including the system security plan; closeout assessment within 180 days of the conditional status date.
- Verified on cisa.gov (fetched 2026-10-27): BOD 22-01 is marked revoked and superseded by BOD 26-04; the KEV catalogue continues.
- No control wording is quoted or paraphrased; ids appear bare.
