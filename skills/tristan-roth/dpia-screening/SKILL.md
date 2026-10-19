---
name: dpia-screening
title: DPIA screening
description: |
  Use this skill when a new product feature, vendor, AI use, monitoring tool or change in processing
  raises the question "do we need a DPIA", or someone asks "DPIA screening", "is this high risk
  processing", "data protection impact assessment threshold", "privacy impact screening for this
  feature", "does our AI feature need a DPIA" or "document why we did not do a DPIA". Describes the
  processing with numbers, tests it against the GDPR cases, the supervisory authority's list and
  the EDPB-endorsed criteria, reaches a reasoned outcome (required, recommended, not required) with
  a re-screen trigger, and keeps a screening log for accountability.
category: privacy
frameworks: [gdpr, iso27701]
tags: [dpia, screening, high-risk-processing, privacy-by-design]
---

Use this at design time, before a processing activity starts or changes, one activity per screening. It produces `./dpia-screening/<activity>-screening.md` and appends a line to `./dpia-screening/screening-log.md`. This skill drafts for a human to review and sign; this skill never marks a control effective. The controller decides whether a DPIA is carried out, after the data protection officer's advice where one is designated.

## Inputs to gather

Read the feature specification, design document or vendor proposal, the record of processing entry if one exists, the data model or field list, and any prior DPIA on similar processing. Ask the reader, in one message: how many people the processing will touch in a year and what share of the relevant population that is, whether any decision about a person is made or shaped automatically, whether employees, children, patients or other vulnerable people are involved, and where the company's main establishment in the EU is.

## Step 1: describe the processing in numbers

Write one paragraph a stranger could assess: purpose, data subject categories, data categories (flag special category and criminal offence data), sources, systems and vendors, recipients, transfers, retention, and the technology involved. Then quantify scale: number of people, volume of records, duration, geographic reach. "Large" without numbers cannot be reviewed. If the reader cannot give numbers, record a range and the assumption.

## Step 2: test against the cases the law names

Article 35(3) of the GDPR names three cases where an assessment is expected: systematic and extensive evaluation of people based on automated processing, including profiling, that leads to decisions with legal or similarly significant effects; large-scale processing of special category or criminal offence data; and systematic monitoring of a publicly accessible area on a large scale. If any one fits, the outcome is "required" and the remaining steps document why.

## Step 3: check the supervisory authority's lists

Each supervisory authority publishes a list of processing types that need an assessment, and some publish a list that does not. Ask the reader to open the list of the authority for the main establishment (and of any country where the processing targets people) on the authority's own website, and record which entries match and which do not, quoting the entry.

## Step 4: apply the endorsed criteria

The guidelines endorsed by the EDPB give nine criteria. Score each yes or no with one line of reasoning:

1. Evaluation or scoring, including profiling and prediction.
2. Automated decision-making with legal or similarly significant effect.
3. Systematic monitoring.
4. Sensitive data or data of a highly personal nature.
5. Large scale (by number of people, volume, duration and geography).
6. Matching or combining datasets in ways people would not expect.
7. Vulnerable data subjects, including employees in relation to their employer.
8. Innovative use or new technology, such as a new AI model applied to people.
9. Processing that prevents people from exercising a right or using a service or contract.

Rule of thumb from the guidelines: two or more criteria usually means an assessment is needed; one can be enough when it is severe. Keep the reasoning honest: product analytics that assigns users to segments is evaluation; a dashboard that tracks employees' activity is systematic monitoring.

## Step 5: reach the outcome and set a trigger

- **Required**: a statutory case, an authority list entry, or two or more criteria. Name the DPIA owner and the questions the assessment will answer first.
- **Recommended**: one criterion with real impact, or high uncertainty about scale. Explain why a proportionate assessment is still worth doing.
- **Not required**: record why each criterion is a no, and set a re-screen trigger tied to something observable (users pass a stated number, a new data category is added, an automated decision is introduced, a new vendor processes the data).

If an existing DPIA already covers similar processing with similar risks, say so and reference it instead of starting again. Write the screening file and the log line (activity, outcome, criteria met, trigger, decision owner).

## What good looks like

- The best practitioner looks first for the decision a person cannot see: scoring, ranking, eligibility, fraud flags, performance metrics. That is where significant effects hide inside "just analytics".
- The common mistake is a checklist answered "no" across the board because the team does not use the word profiling, with no numbers anywhere. The tell: no scale figures, no quoted authority list entry, and no re-screen trigger.
- The opposite mistake is screening every minor change into a full assessment until nobody reads them. Proportion is part of the job.
- Good output lets the data protection officer agree or disagree in five minutes because every criterion has a reason and a number behind it.

## Framework lookups

If ISMS Copilot is connected to your agent (MCP server `https://account.ismscopilot.com/v1/account/mcp`), ask it the framework question with `create_conversation` (mode `think`, `answer_format: decision`) and keep one conversation for this task. Send only a short question in your own words, show it to the user first, and never include file contents, secrets, personal data or evidence. If it is not connected, check the official text of the framework yourself; this skill does not restate it. Set it up: https://www.ismscopilot.com/mcp?ref=grcskills-dpia-screening

## Rules

- MUST quantify scale or record the assumption behind every scale answer.
- MUST give a reason for every criterion scored no, not only for the yeses.
- MUST write outputs only inside `./dpia-screening/` and ask before overwriting.
- NEVER record a "not required" outcome without a re-screen trigger.
- NEVER decide on the controller's behalf whether a DPIA is carried out.
- NEVER copy real personal data or individuals' names into a screening; describe categories.
