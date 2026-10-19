# Copilot challenge: incident-response-plan-drafting

- Date: 2026-10-19
- Conversation: 91c176aa-79ed-417a-9491-d0f99f7ab994 (ISMS Copilot, mode think, answer_format decision)
- Verdicts: Q1 PASS, Q2 PASS, Q3 PASS

## Fixes applied

1. GDPR duty made role-dependent: as a processor for customer data, tell each affected customer without undue delay (Art. 33(2)); listing affected customers is a first-hour task.
2. NIS 2 staged clock shown in the plan: early warning within 24 hours, notification within 72 hours, final report within one month of the notification (Art. 23(4)).
3. Intake asks the role (controller or processor; covered entity or business associate); a business associate tells the covered entity at the latest 60 days after discovery (45 CFR 164.410).
4. Severity linked to notification: any level touching personal data, health data or NIS 2 services opens the notification check; the scribe records the awareness time first.
5. Learning loop: written lessons with owner and date fed into corrective actions; each plan re-approval date recorded.

## Fixes declined

- Copilot's ISO clause and Annex A references for the learning loop were not copied in (IP rule); the practice is described in the skill's own words.

## Citations

- GDPR Art. 33, 34; NIS 2 Art. 23; 45 CFR 164.400 to 414: confirmed by Copilot; kept.
- GDPR Art. 33(2) (processor to controller without undue delay), NIS 2 Art. 23(4) (24 hours, 72 hours, one month after the notification), 45 CFR 164.410 (business associate to covered entity, no later than 60 calendar days after discovery): added on Copilot's advice; confirmed by Copilot and consistent with the official texts. Sources: https://eur-lex.europa.eu/eli/reg/2016/679/oj, https://eur-lex.europa.eu/eli/dir/2022/2555/oj, https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D
