# Copilot challenge: business-impact-analysis

- Date: 2026-10-19
- Conversation: 91c176aa-79ed-417a-9491-d0f99f7ab994 (lane A, message b998e1b0-0213-4ef1-b8a1-885457975d9a)
- Verdicts: Q1 PASS, Q2 PASS, Q3 PASS

## Fixes applied

1. Recovery time margin made explicit: maximum tolerable downtime minus invocation time minus verification time; invocation time column added to `bia.csv`.
2. Notification channels (status page, email provider, support tool) added as dependencies of every critical service.
3. Re-review owner and default date (twelve months) recorded in `bia-notes.md`.
4. DORA simplified framework (Art. 16): small entities still need the analysis, in proportion.
5. Achievable recovery time and data loss recorded as numbers from the last restore test and backup frequency.

## Fixes declined

- Delegated Regulation (EU) 2024/1774 article range for the simplified framework: not added (not verified, not needed for the practice).

## Citations

- DORA Art. 11 (business impact analysis within ICT business continuity) and Art. 16 (simplified framework): confirmed by Copilot. Source: https://eur-lex.europa.eu/eli/reg/2022/2554/oj
- NIS 2 Art. 21(2)(c): confirmed by Copilot. Source: https://eur-lex.europa.eu/eli/dir/2022/2555/oj
