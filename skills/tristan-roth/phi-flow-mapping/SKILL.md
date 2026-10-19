---
name: phi-flow-mapping
title: Health data flow mapping
description: |
  Use this skill when a covered entity or business associate needs to know where protected health
  information lives and moves, or asks "map our PHI", "ePHI inventory", "HIPAA data flow diagram",
  "where does patient data go", "PHI flow map for the risk analysis", "which vendors need a BAA" or
  "do our logs contain PHI". Traces health data from where it enters, through systems, integrations,
  logs, backups and vendors, to where it leaves and is disposed of, records the safeguards that
  cover each flow and the business associate agreement behind each external one, and lists the gaps
  as input to the security risk analysis.
summary: "A map of where protected health information enters, moves and rests, across systems, logs, backups and vendors, with BAA gaps flagged."
category: privacy
frameworks: [hipaa]
tags: [phi, ephi, data-flow, baa, risk-analysis-input]
---

Use this before a security risk analysis, when a new system, integration or vendor touches health data, or when nobody can say with confidence which systems hold it. You get three files in a new folder, `./phi-flow-mapping/`: a spreadsheet you can open in Excel listing every place health data enters, sits or leaves, with its safeguards (`phi-inventory.csv`), simple diagrams of how the data moves (`flows.md`), and a list of the protection gaps found, each with a proposed owner (`safeguard-gaps.md`). This skill drafts for a human to review and sign; this skill never marks a control effective. The privacy and security officers confirm the map and own the decisions on gaps.

## Inputs to gather

Read the system inventory, architecture and integration diagrams, the vendor list with business associate agreement status, field lists for patient-facing systems, logging and backup configuration, and the last risk analysis. Ask the reader, in one message: whether the company is a covered entity, a business associate or both, which products and teams touch health data, and whether paper or fax is still in use.

## Step 1: define what counts

Write down the health data categories in scope (clinical, billing, identifiers linked to care, sensitive categories such as mental health) and which identifiers make data identifiable. Note what the company treats as de-identified and how. HIPAA recognises two methods under 45 CFR 164.514(b): an expert determination, or the safe harbor method. Safe harbor has two parts, and both need evidence in the inventory: the listed identifiers of the individual and of their relatives, employers and household members are removed, and the company has no actual knowledge that what remains could identify the person, alone or combined with other data (HHS de-identification guidance). Data only "masked" or "anonymised" by internal convention stays in scope until one method is shown in full. Teams often miss dates and ages over 89, and a re-identification code may not be derived from the identifiers (164.514(c)). Flag any flow carrying records from a federally assisted substance use disorder program: 42 CFR Part 2 adds stricter consent and redisclosure rules, so counsel reviews those flows.

## Step 2: trace each flow through five stages

For each product or business process, follow the data:

1. **Enters**: portals, intake forms, provider integrations, claims feeds, uploads, phone, email, fax.
2. **Moves**: internal services, integrations, exports, reports, messages between teams.
3. **Rests**: primary stores, and the hidden copies: backups, replicas, logs and error trackers capturing request bodies, analytics warehouses, support tickets, inboxes, chat, laptops, test copies, and AI tools staff paste text into.
4. **Leaves**: disclosures to business associates, payers, providers, public health or research, and tracking technologies on patient pages (check current HHS guidance on those).
5. **Ends**: retention, deletion, media disposal, return or destruction when a vendor contract ends.

Record each system or flow in the inventory spreadsheet (`phi-inventory.csv`): id, stage, system or flow, data categories, volume (order of magnitude), owner role, location (hosting region, device, paper), whether it is a source of truth or a copy, and on whose behalf the data is held (the company's own patients, or a named covered entity client when the company is a business associate, whose agreement then limits what it may do with the data).

## Step 3: record the safeguards per flow

For each row, record what protects it, with the evidence path:

- Access: who can reach it, how access is granted and reviewed, and whether it is the minimum necessary.
- Encryption at rest and in transit. Mark data in a store or flow that is not encrypted or destroyed by a method HHS recognises as unsecured (45 CFR 164.402). Unsecured data is what the breach rule analyses; whether a given incident is notifiable still depends on the exceptions in 164.402 and a documented assessment of the probability that the data was compromised, which the privacy or security owner makes, not the agent.
- Audit logging: whether access is logged and someone reads the logs.
- Integrity and backup: changes tracked, restores tested.
- External flows: the business associate agreement in place, or the reason none is needed; for a business associate, the subcontractor agreements that flow the same terms down. For disclosures outside treatment, payment and operations (research, public health, legal requests), name the log that supports an accounting of disclosures (45 CFR 164.528). A cloud provider storing health data is generally a business associate even when it cannot read it; the conduit exception is narrow.

Mark any safeguard without evidence as "claimed, not evidenced". Where a specific safeguard question matters (required or addressable, for example), run a framework lookup instead of guessing.

## Step 4: draw the map and list the gaps

In the diagrams file (`flows.md`), draw one diagram per product or process, in text or a diagram syntax the reader's tools render, marking trust boundaries and external parties. In the gap list (`safeguard-gaps.md`), list each gap with the flow id, what is missing, the likely consequence, and a proposed owner. Typical first findings: logs holding health data with broad engineer access, test environments seeded with production records, and vendors without an agreement. The list feeds the security risk analysis; it does not replace it.

## What good looks like

- The best practitioner looks first at the copies nobody designed: logs, error tracking, analytics, support attachments, test databases and staff AI use, where unprotected health data most often sits.
- The common mistake is a diagram of the intended architecture with one box for "the database". The tell: no logs, backups, exports or vendors on the map, and no row marked as a copy.
- Good output lets the security officer answer "where is our ePHI, who can reach it, and who outside the company receives it" from one inventory, with every external flow tied to an agreement or a documented reason.

## Framework lookups

If ISMS Copilot is connected to your agent (MCP server `https://account.ismscopilot.com/v1/account/mcp`), ask it the framework question with `create_conversation` (mode `think`, `answer_format: decision`) and keep one conversation for this task. Send only a short question in your own words, show it to the user first, and never include file contents, secrets, personal data or evidence. If it is not connected, check the official text of the framework yourself; this skill does not restate it. Set it up: https://www.ismscopilot.com/mcp?ref=grcskills-phi-flow-mapping

## Rules

- MUST describe health data by category and volume only, never by record.
- MUST tie every external flow to a business associate agreement or a documented reason none is needed.
- MUST write outputs only inside `./phi-flow-mapping/` and ask before overwriting.
- NEVER open, copy, sample or paste actual patient records, even to confirm a field holds health data; use schemas, field names and configuration.
- NEVER treat data as de-identified without a recognised method shown in full; for safe harbor, both the identifier removal and the absence of actual knowledge.
- NEVER change access, logging or vendor settings; list the gap for the owner.
