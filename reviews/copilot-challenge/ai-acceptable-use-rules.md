# Copilot challenge: ai-acceptable-use-rules

- Date: 2026-10-19
- Conversation: 91c176aa-79ed-417a-9491-d0f99f7ab994 (lane A, message e309ff16-5b94-4c22-9f23-d7037353d7ea)
- Verdicts: Q1 PASS, Q2 PASS, Q3 PASS

## Fixes applied

1. Step 1 names the AI uses people forget to declare: transcription bots, AI features inside email, documents and CRM, editor code completion, browser assistant extensions.
2. `approved-tools.csv` records the checks behind each approval (data location, retention, subprocessors, breach notice) and a re-check date, because vendor terms drift.
3. Hiring and HR AI pilots: a data protection impact assessment is screened at the same time as the HR and legal review.
4. `rollout-notes.md` notes which parts of the AI management system the rules and tools list evidence, via framework lookup.
5. (Fix 5, re-review rule) merged into fix 2.

## Fixes declined

- ISO 42001 Annex A identifiers from the reply: not copied (IP rule).
- GDPR Art. 35 citation for the DPIA: not added; the skill is not tagged `gdpr` and the plain wording carries the practice.
- Copilot mentioned a 2 December 2027 application date for Annex III high-risk obligations (a proposed amendment, not verified here); not added. The skill states no application dates.

## Citations

- EU AI Act Art. 4 (AI literacy) and Art. 50 (transparency for interactions and generated content): confirmed by Copilot, kept. Source: https://eur-lex.europa.eu/eli/reg/2024/1689/oj
