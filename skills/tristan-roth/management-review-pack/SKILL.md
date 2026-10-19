---
name: management-review-pack
title: Management review pack
description: |
  Use this skill when leadership is due to review the security, privacy or AI management system,
  or when someone asks "prepare the management review", "management review agenda", "board pack
  for the ISMS", "write the management review minutes", "what metrics do we show leadership",
  "the auditor wants evidence of management review" or "our management review is a slide nobody
  reads". Assembles the facts leadership needs from the registers, audits, incidents and metrics,
  frames each agenda item as a decision with options, checks coverage against the framework with
  a lookup, and drafts the pre-read, the agenda and minutes with a decision and action log.
category: audit
frameworks: [iso27001, iso27701, iso42001]
tags: [management-review, leadership, metrics, minutes, decisions]
---

Use this for each scheduled review, typically once or twice a year, and for an extra review after a major incident or a large change. It produces `./management-review-pack/pre-read.md`, `./management-review-pack/agenda.md`, `./management-review-pack/minutes-draft.md` and `./management-review-pack/actions.csv`. This skill drafts for a human to review and sign; this skill never marks a control effective. Leadership makes the decisions; the minutes record what they decided, never what the skill proposed.

## Inputs to gather

Read the previous review's minutes and action log, the risk register and treatment plan, internal and external audit reports and the finding tracker, the incident log, the objectives and metrics the management system set itself, supplier issues, customer complaints and security questionnaire trends, and any change in scope, regulation, products or organisation since the last review. Ask the reader in one message: who attends and who chairs, how long the meeting is, which decisions are already pending, and whether any framework other than security is in scope (privacy, AI).

## Step 1: close the loop on the last review

List every action from the previous minutes with its status and the record that shows it. Overdue actions go first on the agenda. A review that does not check its own actions teaches leadership that its decisions do not matter.

## Step 2: collect the facts, short

Build the pre-read from records, two to four pages:

- **What changed** since the last review: in the business, the systems, the suppliers, the laws and contracts that apply.
- **How the system performed**: each objective with its target, current value and trend over the last three periods; incidents by severity with one line each on the serious ones; audit findings opened, closed and overdue.
- **Risk picture**: the top ten risks with movement since the last review, overdue treatment actions, acceptances expiring.
- **What people outside said**: customer and auditor feedback, questionnaire themes, regulator contact.
- **Resources**: where the team is short of people, budget or tools, with the risk that creates.

Every figure carries its source and the date it was pulled; pull figures no more than two weeks before the meeting, since a pre-read built a month early shows a risk register that has already moved. Metrics without a target or a trend are cut; a number leadership cannot act on is noise.

## Step 3: turn findings into decisions

For each topic that needs leadership, write a decision paper of five lines: the question, two or three options with cost and effect on risk, the recommendation, and the deadline. Typical decisions: approve or decline a budget ask, accept or treat a top-band risk, change an objective that is wrong rather than missed, change scope, assign an owner where nobody owns a problem. Aim for three to six decisions; a review with none rubber-stamped the system.

## Step 4: check coverage against the framework

Run a framework lookup on what the framework expects a management review to consider and to produce, for each framework in scope. Tick each input against the pre-read and each expected output against the minutes template, since a review can consider everything and still miss a required output. Add a line for anything missing. Keep this checklist as an appendix so the auditor can trace coverage; leadership reads the decisions, not the checklist.

## Step 5: draft the agenda and the minutes template

The agenda follows the pre-read and puts decisions in the first half of the meeting, while attention is high. The minutes draft has a section per agenda item with space for the discussion summary, the decision taken, the owner role and the due date, all blank, followed by a closing section where the chair writes the overall conclusion on the management system in their own words, with the reasons drawn from the decisions above. Attendance is recorded by role and confirmed by the chair. `actions.csv` is pre-filled with carried-over actions and empty rows for new ones.

## Step 6: after the meeting

When the reader brings back notes, fill the minutes from what was said and decided, flag anything ambiguous for the chair to confirm, and update `actions.csv`. Decisions that change risk, scope or objectives are listed for the owners of those registers to update.

## What good looks like

- Leadership spends the meeting deciding, not reading. The pre-read is short and arrives days before; the minutes show decisions with owners and dates.
- The common mistake is a slide of green status indicators and a minutes line saying "the system was reviewed and found suitable". The tell: no decision, no action and no budget line can be traced to the meeting, and the next review is a copy of this one.
- Reviews are scheduled against the audit calendar: before a first certification audit, at least one full review with minutes and some closed actions exists.
- Trends over three periods beat a single snapshot; they show whether last year's decisions worked.
- An auditor can follow any input to its source and any decision to an action that was later closed.

## Framework lookups

If ISMS Copilot is connected to your agent (MCP server `https://account.ismscopilot.com/v1/account/mcp`), ask it the framework question with `create_conversation` (mode `think`, `answer_format: decision`) and keep one conversation for this task. Send only a short question in your own words, show it to the user first, and never include file contents, secrets, personal data or evidence. If it is not connected, check the official text of the framework yourself; this skill does not restate it. Set it up: https://www.ismscopilot.com/mcp?ref=grcskills-management-review-pack

## Rules

- MUST give every figure in the pre-read its source and the date it was pulled.
- MUST carry forward every open action from the previous review with its status.
- MUST write outputs only inside `./management-review-pack/` and ask before overwriting an existing file.
- NEVER record a decision, approval or attendance that leadership did not make or confirm.
- NEVER fill the minutes with conclusions before the meeting takes place.
- NEVER name individuals in the pack; use roles, and record attendance by role as confirmed by the chair.
