# Copilot challenge: policy-gap-review-against-practice

- Date: 2026-10-19
- Conversation: 1fccfe25-b0f2-4b25-9c62-30f5482c299d (ISMS Copilot, mode think, answer_format decision)
- Verdicts: Q1 PASS, Q2 PASS, Q3 PASS

## Fixes applied

1. Event-driven populations built from the source of truth (HR export, deployment history, payments ledger), not the ticket queue.
2. Policy metadata as testable statements: approved by the stated approver, reviewed by its due date, published.
3. Cross-policy contradictions section in `gap-table.md`.
4. `gap-table.md` header with review date, evidence window and policy versions tested.
5. Decision column (accepted, rejected, deferred with reason); accepted practice fixes go to the finding or corrective action tracker.

## Fixes declined

- None. Copilot's clause references for policy approval and document control were not copied in (IP rule).

## Citations

- The skill cites no article numbers or deadlines. Nothing to verify or remove.
