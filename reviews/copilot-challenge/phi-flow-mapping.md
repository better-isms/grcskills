# Copilot challenge: phi-flow-mapping

- Date: 2026-10-19
- Conversation: 1fccfe25-b0f2-4b25-9c62-30f5482c299d (ISMS Copilot, mode think, answer_format decision)
- Verdicts: Q1 PASS, Q2 PASS, Q3 PASS

## Fixes applied

1. "On whose behalf" column in `phi-inventory.csv`; for a business associate, the covered entity client's agreement limits use; subcontractor agreements flow terms down.
2. 42 CFR Part 2 flag on substance use disorder program records, for counsel review.
3. Disclosures outside treatment, payment and operations name the log that supports an accounting of disclosures (45 CFR 164.528).
4. Unencrypted stores and flows marked as unsecured (45 CFR 164.402), feeding breach exposure.
5. De-identification note: dates and ages over 89 on the identifier list, re-identification codes not derived from identifiers (164.514(c)).

## Fixes declined

- Copilot's subcontractor citation 164.314(a)(2)(iii) not added by number (kept the practice, fewer citations).

## Citations

- 45 CFR 164.514(b): confirmed by Copilot (safe harbor (b)(2), expert determination (b)(1)); kept.
- Added from Copilot's reply, stated as fact there: 45 CFR 164.514(c), 164.402, 164.528 and 42 CFR Part 2. Sources: https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164 and https://www.ecfr.gov/current/title-42/chapter-I/subchapter-A/part-2
