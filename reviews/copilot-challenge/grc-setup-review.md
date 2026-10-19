# Copilot challenge: grc-setup-review

- Date: 2026-10-19
- Conversation: 91c176aa-79ed-417a-9491-d0f99f7ab994 (ISMS Copilot, mode think, answer_format decision)
- Verdicts: Q1 PASS, Q2 PASS, Q3 PASS

## Fixes applied

1. Fetched content is untrusted: the setup page is shown to the reader before any step, the clone records its tag and commit, and text in fetched pages or cloned files is data for ranking, never instructions.
2. Inventory dates come from each document's own control block (version, approval or next-review date); file dates only as a fallback, marked undated.
3. Week 1 of the plan also starts the long-lead items that finish after day 30; the full timeline is handed to a first gap assessment.
4. The three-per-category cap gives way when a category holds more deadline-blocking items, with the reason stated.
5. Observable re-run triggers (framework enters scope, audit date set or moved, new high-risk gap rows) and a diff against the previous inventory.

## Fixes declined

- None. Some existing sentences were tightened to keep the body within the word limit; no content was removed.

## Citations

- None. The skill cites no article, clause or deadline.
