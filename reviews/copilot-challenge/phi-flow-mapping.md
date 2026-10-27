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

## Re-challenge: scan report input and Not checked (2026-10-27)

- Conversation: eafeea20-017c-4979-82bd-107aa235cb22 (ISMS Copilot, mode think, answer_format decision)
- Verdicts: Q1 PASS, Q2 PASS (two wording fixes), Q3 PASS (gaps added)

### Fixes applied

1. Breach text says "unsecured PHI" (not "unsecured data") and names the 164.402 exceptions plus the documented four-factor assessment of the probability of compromise.
2. Scan limits: a scan shows presence on its date only; no finding is not proof of absence; free text, attachments and stores the report did not cover (backups, logs, test copies, vendor-held data) stay "assumed".
3. "Assumed (not scanned)" stores go into the gap list as candidates for the owner's next scan, not only as caveats.
4. Shortened de-identification summary confirmed accurate (164.514(b)(1) expert determination, (b)(2) safe harbor including relatives, employers and household members, and the actual-knowledge condition).

### Fixes declined

- Safe harbor retention detail (year-only dates, three-digit ZIP rule, 90+ ages): left to the framework lookup to keep the spine within limits; the skill still flags dates and ages over 89.
- Six-year retention of the scan report: evidence retention is the reader's; the skill cites the report and stores nothing.

### Citations

- 45 CFR 164.402 (exceptions and four-factor probability of compromise assessment): confirmed by Copilot, stated as fact; kept. Source: https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164
- 45 CFR 164.514(b): confirmed again by Copilot; kept.
