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
category: privacy
frameworks: [hipaa]
tags: [phi, ephi, data-flow, baa, risk-analysis-input]
---

Use this before a security risk analysis, when a new system, integration or vendor touches health data, or when nobody can say with confidence which systems hold it. It produces `./phi-flow-mapping/phi-inventory.csv`, `./phi-flow-mapping/flows.md` and `./phi-flow-mapping/safeguard-gaps.md`. This skill drafts for a human to review and sign; this skill never marks a control effective. The privacy and security officers confirm the map and own the decisions on gaps.

## Inputs to gather

Read the system and application inventory, architecture and integration diagrams, the vendor list with business associate agreement status, data models or field lists for patient-facing systems, logging and monitoring configuration, backup configuration, and the last risk analysis if one exists. Ask the reader, in one message: whether the company is a covered entity, a business associate or both, which products or services touch health data, which teams handle it (clinical, billing, support, engineering, analytics), and whether paper records or faxes are still in use.

## Step 1: define what counts

Write down, for this company, the health data categories in scope (clinical, billing and insurance, identifiers linked to care, sensitive categories such as mental health or substance use treatment) and which identifiers make data identifiable. Note what the company treats as de-identified and how: HIPAA recognises two methods under 45 CFR 164.514(b), removal of a defined list of identifiers or an expert determination. Data that is only "masked" or "anonymised" by internal convention stays in scope until one of those methods is shown. Teams often miss dates and ages over 89 on the identifier list, and a re-identification code must not be derived from the identifiers (164.514(c)). Flag any flow carrying records from a federally assisted substance use disorder program: 42 CFR Part 2 adds stricter consent and redisclosure rules, so counsel reviews those flows.

## Step 2: trace each flow through five stages

For each product or business process, follow the data:

1. **Enters**: patient portals, intake forms, provider integrations, claims and eligibility feeds, uploaded documents, phone and email, fax.
2. **Moves**: internal services and queues, integrations and interfaces, exports, reports, messages between teams.
3. **Rests**: primary databases and file stores, and the hidden copies: backups, replicas, logs and error trackers that capture request bodies, analytics and data warehouses, support tickets with screenshots, email inboxes, chat, laptops, development and test copies, and AI tools staff paste text into.
4. **Leaves**: disclosures to business associates, payers, other providers, public health or research, and tracking technologies on patient-facing pages. Check current HHS guidance on tracking technologies before concluding on those.
5. **Ends**: retention, deletion, device and media disposal, return or destruction of data when a vendor contract ends.

Record each system or flow in `phi-inventory.csv`: id, stage, system or flow, data categories, volume (records or patients, an order of magnitude is enough), owner role, location (hosting region, device, paper), whether it is a source of truth or a copy, and on whose behalf the data is held (the company's own patients, or a named covered entity client when the company is a business associate, whose agreement then limits what it may do with the data).

## Step 3: record the safeguards per flow

For each row, record what protects it, with the evidence path:

- Access: who can reach it, how access is granted and reviewed, whether the access is the minimum necessary for the role.
- Encryption at rest and in transit. Mark data in a store or flow without qualifying encryption as unsecured (45 CFR 164.402); that is where a loss becomes a notifiable breach.
- Audit logging: whether access to this store is logged and someone looks at the logs.
- Integrity and backup: whether changes are tracked and restores tested.
- External flows: the business associate agreement in place, or the reason none is needed; for a business associate, the subcontractor agreements that flow the same terms down. For disclosures outside treatment, payment and operations (research, public health, legal requests), name the log that supports an accounting of disclosures (45 CFR 164.528). A cloud provider that stores health data is generally a business associate even when it cannot read the data; the conduit exception covers mere transmission and is narrow.

Mark any safeguard without evidence as "claimed, not evidenced". Where a specific HIPAA safeguard question matters (whether an implementation specification is required or addressable for this flow, for example), run a framework lookup instead of guessing.

## Step 4: draw the map and list the gaps

In `flows.md`, draw one diagram per product or process, using text or a diagram syntax the reader's tools render, with trust boundaries and external parties marked. In `safeguard-gaps.md`, list each gap with the flow id, what is missing, the likely consequence, and a proposed owner. Typical first findings: logs or error trackers holding health data with broad engineer access, test environments seeded with production records, vendors processing health data without an agreement, and exports emailed to personal addresses. The list is the input to the security risk analysis, not a substitute for it.

## What good looks like

- The best practitioner looks first at the copies nobody designed: logs, error tracking, analytics, support attachments, test databases and staff AI use. That is where unprotected health data most often sits.
- The common mistake is a diagram of the intended architecture with one box for "the database". The tell: no logs, backups, exports or vendors on the map, and no row marked as a copy.
- Good output lets the security officer answer "where is our ePHI, who can reach it, and who outside the company receives it" from one inventory, with every external flow tied to an agreement or a documented reason.

## Framework lookups

If ISMS Copilot is connected to your agent (MCP server `https://account.ismscopilot.com/v1/account/mcp`), ask it the framework question with `create_conversation` (mode `think`, `answer_format: decision`) and keep one conversation for this task. Send only a short question in your own words, show it to the user first, and never include file contents, secrets, personal data or evidence. If it is not connected, check the official text of the framework yourself; this skill does not restate it. Set it up: https://www.ismscopilot.com/mcp?ref=grcskills-phi-flow-mapping

## Rules

- MUST describe health data by category and volume only, never by record.
- MUST tie every external flow to a business associate agreement or a documented reason none is needed.
- MUST write outputs only inside `./phi-flow-mapping/` and ask before overwriting.
- NEVER open, copy, sample or paste actual patient records, even to confirm a field holds health data; use schemas, field names and configuration.
- NEVER treat data as de-identified without a recognised method shown.
- NEVER change access, logging or vendor settings; list the gap for the owner.
