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
