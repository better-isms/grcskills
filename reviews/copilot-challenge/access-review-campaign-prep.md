# Copilot challenge: access-review-campaign-prep

- Date: 2026-10-19
- Conversation: 91c176aa-79ed-417a-9491-d0f99f7ab994 (lane A, message b7d607d1-55e4-41c8-b4fc-08c5ee960941)
- Verdicts: Q1 PASS, Q2 PASS, Q3 PASS

## Fixes applied

1. Non-human access added to each population: API keys, personal access tokens, OAuth grants, service principals, SSH keys, each with owner and last-used date.
2. New "Mover" pre-flag (role or team changed in HR since the last review).
3. Per-reviewer sign-off line in `campaign-plan.md` (list, date, keep/remove/change counts).
4. Retention sentence: keep exports, decisions and re-exports for the company's document retention period; framework lookup if a regulation sets a longer one.
5. New "Break-glass" pre-flag: recorded reason per use and credential re-locked after.

## Fixes declined

- Specific retention citation (HIPAA six-year documentation rule) not added: it covers required documentation broadly and stating it for access review records specifically could overstate it; the skill points to a framework lookup instead.
- Annex A, PCI DSS requirement and SOC 2 criterion identifiers from the reply: not copied (IP rule).

## Citations

- None in the skill. Nothing verified or removed.
