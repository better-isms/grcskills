# Copilot challenge: backup-restore-test-evidence

- Date: 2026-10-19
- Conversation: 91c176aa-79ed-417a-9491-d0f99f7ab994 (lane A, message cbc71181-e480-4d77-8c64-1e9513ce8112)
- Verdicts: Q1 PASS, Q2 PASS, Q3 PASS

## Fixes applied

1. Plan declares the time of the simulated failure, so data loss is measured against a fixed scenario.
2. Clean-environment restore lists the stack's dependencies (DNS, certificates, secret store, identity provider, email or payment endpoints) and which the test exercises.
3. A measured time beyond the objective goes to the risk register, then fix or written risk acceptance by the business owner.
4. Restored copy: target environment access controls stated in the plan; deletion proven by a listing, not a screenshot of the delete.
5. Open findings from the last test carried into the plan and marked closed or still open in the record.

## Fixes declined

- Annex A, SOC 2 criterion, HIPAA and DORA article references from the reply: not added; the skill keeps deferring frequency and scope to a framework lookup (IP rule for ISO and AICPA; no need to add public-law numbers that Copilot only mentioned as context).

## Citations

- None in the skill. Nothing verified or removed.
