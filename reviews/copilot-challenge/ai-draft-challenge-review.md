# Copilot challenge: ai-draft-challenge-review

- Date: 2026-10-27
- Conversation: a8bdeafb-72cd-4b8f-abbe-9659a14830ef (ISMS Copilot, mode think, answer_format decision)
- Verdicts: Q1 PASS, Q2 PASS (with fixes), Q3 PASS (fixes applied)

## Fixes applied

1. Competence is not independence: a part the approver wrote or briefed the agent on gets an independent co-reviewer, or is recorded as reviewed by its author only.
2. Decision vocabulary for the approver: approved as drafted, approved with the listed changes, approved subject to a stated condition, returned for rework.
3. Disposition rule: every contradicted or not found item is fixed or written into the decision as a condition; it never passes silently.
4. Source currency: each quoted source carries its date; a source older than the period a claim covers does not support "operating".
5. A whole-draft read for internal consistency, alongside the sample-first approach.
6. Re-review trigger: if the owner's new version changes anything beyond the agreed change list, the review reopens. The worksheet is kept with the signed artefact.
7. A run of "approved as drafted" is framed as a signal for the programme owner, not a nonconformity against any framework.
8. New rule: never copy personal data, secrets or more of a source than the claim needs into the worksheet.

## Fixes declined

- Per-artefact blocks with clause and control numbers: not added (IP rule, no requirement restatement); the skill sends framework questions to a lookup.
- SOC 2 "never say certified" guard: not relevant to a review checklist that writes no framework claims.
- Cross-artefact consistency pass: covered by the `document-consistency-check` skill, not repeated here.

## Citations

- None in the skill. Copilot cited clause and control numbers in its reply; none were copied, so nothing needed verification.
