---
name: system-categorization-first-pass
title: System categorization first pass
description: |
  Use this skill when a system enters the Risk Management Framework, or its categorization is
  missing, inherited from another system or out of date, and someone asks "categorize the
  system", "what is our impact level", "is this system moderate or high", "draft the security
  categorization", "list our information types", "define the authorization boundary" or "the
  categorization was never approved". Drafts the system description and boundary, the information
  types with provisional confidentiality, integrity and availability impact levels and the reason
  for each, the high-water mark, and the decisions the system owner and the authorizing official
  still have to make, for a named official to approve.
summary: "A draft system categorization: boundary, information types, impact levels with reasons, the high-water mark and what the official decides."
category: risk
frameworks: [nist-rmf, nist-800-53]
tags: [rmf, categorization, impact-level, information-types, authorization-boundary, high-water-mark]
---

Use this at the start of an authorization, after a boundary change, or when nobody can show who approved the impact level. You get three files in a new folder, `./system-categorization-first-pass/`: a system description with the boundary, interconnections and what sits outside it (`system-description.md`); a spreadsheet you can open in Excel with one row per information type and its provisional impact level for confidentiality, integrity and availability, each with a reason (`information-types.csv`); and a categorization memo with the high-water mark, the adjustments proposed and an empty approval block (`categorization-memo.md`). This skill drafts for a human to review and sign; this skill never marks a control effective. The categorization is set by the system owner and approved by the authorizing official or the representative the organization names; the skill proposes it and never sets it.

## Inputs to gather

Read: the architecture and data flow diagrams, the asset inventory for the system, interconnection and data sharing agreements, the mission or business process the system supports, the privacy impact assessment or PII inventory if one exists, any earlier categorization, and contracts or agency guidance that name an impact level. Ask the reader, in one message: who are the system owner and the owners of the information it holds, who is the authorizing official, whether the system is a national security system, which processes stop if the system is down for a day, and whether the organization keeps its own catalogue of information types.

## Step 1: draw the boundary before anything else

Write the system description (`system-description.md`): purpose, users, the components inside the boundary (hosts, services, data stores, accounts in a cloud tenant), and every interconnection that crosses it, with the other system's owner and the agreement behind it. List what is outside and why: the corporate identity provider, a cloud provider's underlying services, a shared logging platform. Those usually provide controls the system inherits later, so name the provider. A boundary around one application whose database runs in a shared cluster is the first thing an assessor challenges; follow the data, not the org chart. Flag every component without an owner.

## Step 2: list the information types

Identify each kind of information the system stores, processes or transmits from the data flows, schemas and interviews, not from the system's name. Map each to the organization's own catalogue if it has one, else to the information type catalogue in SP 800-60, and record which. Include the system's own management information (audit logs, configuration, credentials in vaults), since it often carries a higher integrity value than the business data. Mark every type that holds personally identifiable information and route it to the privacy officer, with the privacy threshold analysis if the organization uses one; whether a privacy impact assessment follows is the privacy officer's call, assessed alongside this categorization.

## Step 3: propose an impact level per objective, with reasons

For each information type, in the information type spreadsheet (`information-types.csv`), propose low, moderate or high for confidentiality, integrity and availability, using the FIPS 199 definitions the reader holds. Start from the catalogue's provisional value, then adjust up or down only with a stated reason tied to this mission: a type routine elsewhere can be moderate here because the system aggregates millions of records; a type can be lower when this mission truly uses it less. Record values kept as they are too, so the trail shows each was reviewed. Write each reason as a consequence ("a one-day outage stops payments to every claimant"), never an adjective. Confidentiality may be not applicable for information already public; integrity and availability rarely are. Columns: type, source of the type, PII (yes or no), provisional value per objective, adjusted value, reason, who supplied the facts.

## Step 4: take the high-water mark and test it

For each objective, the system value is the highest value among its information types. Record the result as the system's security category, the triple, in the memo (`categorization-memo.md`); the highest of the three drives the control baseline under FIPS 200 and SP 800-53B. Then test it from the other direction: ask what the worst realistic failure of the system as a whole would do, including loss of the interconnections other systems depend on. If that answer is worse than the triple says, a type is missing or under-rated; go back to step 2. For a national security system, stop here and say so: categorization follows CNSSI 1253, which keeps the three values separate; run a framework lookup and check the current revision and any overlays.

## Step 5: list the decisions and hand over

End the memo with the decisions the skill cannot take, each with its owner role: approve or change each adjusted value, confirm the boundary and the components left out, accept the PII findings, and approve the categorization as a whole. Note where the approved categorization is recorded. Add an approval block (system owner, information owners consulted, authorizing official or designated representative, decision, date) left blank, and note what forces a re-categorization: a new information type, a new interconnection, a boundary change, a large change in data volume or aggregation, a change in mission, or a new impact level set by the agency or a contract. Ask before overwriting any file.

## What good looks like

- Every impact value has a reason a non-specialist can read, tied to a consequence for this mission. A good practitioner reads the availability column first: it is where "moderate everywhere" hides real outage tolerance.
- The common mistake is to pick the overall level first, usually moderate because that is what the last system got, and backfill the information types to match. The tell: every type has the same triple, and no reason mentions a number of people, records or hours.
- The boundary includes everything that processes the data, and every exclusion names the provider that carries the control.
- Adjustments are few and argued; each traces to a fact the reader gave.
- The approval block stays empty until a named official signs, and the memo says what is being approved.

## Framework lookups

If ISMS Copilot is connected to your agent (MCP server `https://account.ismscopilot.com/v1/account/mcp`), ask it the framework question with `create_conversation` (mode `think`, `answer_format: decision`) and keep one conversation for this task. Send only a short question in your own words, show it to the user first, and never include file contents, secrets, personal data or evidence. If it is not connected, check the official text of the framework yourself; this skill does not restate it. Set it up: https://www.ismscopilot.com/mcp?ref=grcskills-system-categorization-first-pass

## Rules

- MUST give a written reason, tied to a consequence for the mission, for every impact value.
- MUST state the source of every information type: the organization's catalogue, the published catalogue, or the reader's own description.
- MUST write outputs only inside `./system-categorization-first-pass/` and ask before overwriting.
- NEVER set or approve the final categorization; leave the decision and signature blank for the named official.
- NEVER lower an impact value to reach a lighter control baseline.
- NEVER copy record contents, credentials or personal data into the information type list; describe the type instead.
