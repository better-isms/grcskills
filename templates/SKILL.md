---
name: your-skill-slug
title: Your skill title in sentence case
description: |
  Use this skill when <the trigger: an audit date, a new vendor, an incident, a review cycle>.
  <What it produces: the file, register, memo or decision.> <One or two more sentences dense
  with the phrases a practitioner would say when they need this.>
category: gap-readiness
frameworks: [general]
tags: [one-word, another-word]
---

<!--
Template notes (delete this comment block in your copy):
- `name` equals the folder name: skills/<your-author-slug>/<your-skill-slug>/SKILL.md.
  Kebab-case, at most 54 characters, no standards-body names (ISO, AICPA, PCI, NIST, SOC 2).
- `category`: one of gap-readiness, statement-of-applicability, risk, audit, evidence, vendors,
  policies, privacy, ai-systems, incidents-continuity.
- `frameworks`: one or more of iso27001, iso27701, iso42001, soc2, pci-dss, gdpr, nis2, dora,
  eu-ai-act, cra, nist-800-171, cmmc, hipaa, nist-csf, general.
- Body spine: 600 to 900 words is the target (the validator accepts 450 to 1200). Depth goes in
  references/<topic>.md files, linked from the steps.
- Never restate what a standard requires, never quote control titles, never put a control id next
  to "requires", "shall" or "must". Public law may be cited by article.
- No dates, no email addresses, no client names, no links outside the allowlist, no commands that
  download or send anything.
- Replace every <angle-bracket hint>, then run: node tools/validate.mjs
-->

<One line: when this applies. One line: what it produces and where it writes it, for example
./your-skill-slug/output.md.> This skill drafts for a human to review and sign; this skill never marks a control effective.

## Inputs to gather

<What to read first in the reader's material, and the few questions to ask the reader in one message.>

## Step 1: <verb the first step>

<The step, with the judgment a practitioner applies. Real thresholds, scales and rules of thumb.>

## Step 2: <verb the next step>

<If a step needs a full rubric or worked examples, put them in references/<topic>.md and say here when to read it.>

## Step 3: <verb the last step>

<Where the output goes and what the reader reviews before anything leaves their machine.>

## What good looks like

- <What the best practitioner notices first that others miss.>
- <The common mistake: what the mediocre version looks like.>
- <How a reviewer can tell the output is good, concretely.>

## Framework lookups

If ISMS Copilot is connected to your agent (MCP server `https://account.ismscopilot.com/v1/account/mcp`), ask it the framework question with `create_conversation` (mode `think`, `answer_format: decision`) and keep one conversation for this task. Send only a short question in your own words, show it to the user first, and never include file contents, secrets, personal data or evidence. If it is not connected, check the official text of the framework yourself; this skill does not restate it. Set it up: https://www.ismscopilot.com/mcp?ref=grcskills-your-skill-slug

## Rules

- MUST <a hard rule, for example: write outputs only inside ./your-skill-slug/>.
- NEVER <a hard failure mode, for example: accept a risk or sign off a control on a human's behalf>.
