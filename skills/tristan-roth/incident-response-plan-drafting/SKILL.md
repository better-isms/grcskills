---
name: incident-response-plan-drafting
title: Incident response plan drafting
description: |
  Use this skill when a company has no incident response plan, has one copied from a template that
  names teams it does not have, or an auditor, customer or insurer asks for it, and the team says
  "write our incident response plan", "IR plan", "security incident procedure", "who does what in an
  incident", "incident playbooks", "contact tree for incidents" or "our plan failed in the last
  incident". Drafts a plan sized to the company with roles and deputies, a severity scale, a contact
  tree with an out-of-band channel, one-page playbooks for the likely scenarios, evidence handling and
  a notification decision step, plus a one-page quick reference card.
summary: "An incident response plan sized to your real team: roles and deputies, a severity scale, a contact tree and one-page playbooks for likely incidents."
category: incidents-continuity
frameworks: [iso27001, soc2, hipaa, nis2]
tags: [incident-response, playbooks, contact-tree, evidence-handling, breach-notification]
---

Use this to write or rewrite the plan, not during a live incident (use the triage skill then). You get a new folder, `./incident-response-plan-drafting/`, holding: the incident response plan itself, under ten pages, for the owner to approve (`incident-response-plan.md`); a one-page cheat sheet people can follow at 3am (`quick-reference.md`); a list of who to call, by role, with blanks for names and numbers (`contact-tree.md`); and one single-page step-by-step guide per likely incident, such as ransomware or a lost laptop (one file each in `playbooks/`). This skill drafts for a human to review and sign; this skill never marks a control effective.

## Inputs to gather

Read the existing plan if any, past incident tickets and post-incident reviews, the risk register, the on-call setup, the vendor list, customer contracts and processing agreements with notification clauses, the cyber insurance policy, and any retainer with a forensics or managed security provider. Ask the reader, in one message: how many people are in engineering and IT, who can authorise shutting down production or spending on outside help at night, which regulations apply (personal data, health data, NIS 2 scope) and in which role (controller or processor; covered entity or business associate), and what went badly in the last real incident.

## Step 1: size the plan to the company

A 30-person company does not have a security operations centre and a crisis committee; a plan that names them fails on the first night. Keep the plan under ten pages and the quick reference to one. Use the roles the company can staff, and name a deputy for every role: plans most often fail because the one person who knows is on holiday.

## Step 2: define roles, severity and decisions

- Roles: incident lead, technical lead, scribe, communications lead, legal and privacy contact, executive decision maker. One person may hold two roles in a small company, never incident lead and scribe at once.
- Severity scale: four levels anchored on customer, data and operational impact, with the response time and call list per level. Reuse the scale from triage so both documents agree. Any level that touches personal data, health data or services in NIS 2 scope opens the notification check at once, and the scribe's first task is to record the awareness time.
- Decisions that need named authority: shutting down production, isolating a customer, engaging outside forensics, paying for anything, talking to press, contacting law enforcement. Write who decides each.

## Step 3: build the contact tree

In the call list (`contact-tree.md`), list by role: internal on-call, executives, legal and privacy, the insurer's notification line, the forensics retainer, key suppliers' security contacts, the relevant authorities and computer emergency teams, and law enforcement. Leave names and numbers as placeholders for the reader to fill in their own copy. Add an out-of-band channel (phones, a separate messaging group) for when email or chat is compromised. Check the insurance policy: many require notice within a short time and use of the insurer's panel; missing that can void cover.

## Step 4: write the playbooks

Pick four to six scenarios from the risk register and past incidents, one guide each in `playbooks/`, typically: ransomware, mailbox or business email compromise, a cloud key or token leaked in a public repository, a lost or stolen laptop, a supplier breach that touches company data, and personal data sent to the wrong recipient. Each playbook fits on one page: triggers, first 30 minutes, containment options with who authorises them, evidence to preserve, recovery, and the notification check.

## Step 5: evidence handling and notification

Write how evidence is preserved before containment changes it: images or snapshots, log export before retention rolls over, a chain of custody log with who handled what and when. Then a notification decision step that points to the regimes and contracts that apply: GDPR Art. 33 and 34 for personal data breaches (as a processor for customer data, the duty is to tell each affected customer without undue delay, Art. 33(2), so listing affected customers is a first-hour task), NIS 2 Art. 23 for significant incidents of entities in scope (up to three submissions on separate clocks: early warning within 24 hours, notification within 72 hours, final report within one month of the notification, Art. 23(4)), the HIPAA breach notification rule (45 CFR 164.400 to 414) for unsecured protected health information (a business associate tells the covered entity, at the latest 60 days after discovery, 164.410), and contract clauses. The plan names who makes each decision; the deadlines are worked out per incident with the reporting clock skill. Run a framework lookup for what each certification framework in scope looks for in the plan itself.

## Step 6: testing and upkeep

Set a cadence: a tabletop exercise at least once a year and after major changes, plan review after every SEV1 or SEV2 and at least annually, contact tree check each quarter. Every exercise and real incident ends with written lessons, each with an owner and date, fed into corrective actions. Name the plan owner and record each re-approval date.

## What good looks like

- Every role in the plan maps to a real person and a deputy in the contact tree, and every decision has a named authority.
- A strong practitioner checks the insurance policy and the customer notification clauses first; they often set the shortest deadlines.
- The common mistake is a long template plan with incident phases explained at length and no company-specific playbook. It satisfies a document request and fails in use.
- The tell that it went wrong: no deputies, no out-of-band channel, no one authorised to shut down production at night, and playbooks for threats the company does not face.

## Framework lookups

If ISMS Copilot is connected to your agent (MCP server `https://account.ismscopilot.com/v1/account/mcp`), ask it the framework question with `create_conversation` (mode `think`, `answer_format: decision`) and keep one conversation for this task. Send only a short question in your own words, show it to the user first, and never include file contents, secrets, personal data or evidence. If it is not connected, check the official text of the framework yourself; this skill does not restate it. Set it up: https://www.ismscopilot.com/mcp?ref=grcskills-incident-response-plan-drafting

## Rules

- MUST name a deputy for every role and an authority for every containment decision.
- MUST base playbooks on the company's own risks and incidents, citing the source for each.
- MUST write outputs only inside `./incident-response-plan-drafting/` and ask before overwriting.
- NEVER fill in personal phone numbers or names in the draft; leave placeholders for the reader.
- NEVER approve or publish the plan on the owner's behalf.
- NEVER change alerting, on-call or system configuration while drafting the plan.
