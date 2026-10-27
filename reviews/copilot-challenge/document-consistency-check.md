# Copilot challenge: document-consistency-check

- Date: 2026-10-19
- Conversation: 91c176aa-79ed-417a-9491-d0f99f7ab994 (lane A, message 7432dc6b-a268-4d3d-aec7-0d4b1d9bf3c7)
- Verdicts: Q1 PASS, Q2 PASS, Q3 PASS

## Fixes applied

1. Extract from approved versions only; rows tagged with version and status; retired documents excluded as owners, pointers to them treated as broken references.
2. Externally fixed values (law, contract) collected in a table at the top of `conflicts.md`.
3. Cross-checks when a statement of applicability and registers are in the set: applicable control has a live implementing document, scope matches inventory and org chart, owners are real roles.
4. Re-verification step after owners edit: each value appears once, in its owner.
5. Severity scale mapped to the external notification clocks it triggers.

## Fixes declined

- Clause identifiers for document control: not copied (IP rule). Wording kept framework-neutral (skill is tagged `general`).

## Citations

- None in the skill. Nothing verified or removed.

## Re-challenge: since-last-run mode (2026-10-27)

- Conversation: 7e61fc98-4473-496e-a1b9-bbab164c964f (ISMS Copilot, mode think, answer_format decision)
- Verdicts: Q1 PASS, Q2 PASS (with fixes), Q3 FAIL on the first draft of the mode; the five gaps are fixed below

### Fixes applied

1. The mode first reconciles the document set against the previous index: added, retired and renamed documents.
2. Content that changed without a new approval is flagged as a finding in itself.
3. Consumers widened: treatment plan lines and review minutes alongside register entries, applicability lines, policy statements and recorded decisions.
4. Open conflicts and the previous Not checked items carry forward until closed.
5. Matching rule made deterministic: by document, section and value, not by loose wording.
6. Wording: an affected decision goes to its owner to reconfirm; the tool never calls a decision invalid.
7. Single-source wording corrected: each value has one owner document and every other mention cites it.

### Fixes declined

- Certification body notification flag: the skill is tagged `general`; routing changes to their owner covers it without naming a scheme.
- Clause references in the reply: not copied (IP rule).

### Citations

- None added. Nothing to verify.
