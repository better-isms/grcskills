---
name: grc-setup-review
title: GRC setup review
description: |
  Use this skill when someone wants to know where to start with the grcskills library, or asks
  "review my GRC setup", "what should I fix before the audit", "which compliance skills do I need",
  "audit my ISMS folder", "give me a 30-day compliance plan" or "rank the skills for my company".
  Reads the frontmatter of every skill in the library, inspects the compliance material the agent
  can reach (repo, policy folder, registers, platform exports), ranks the 10 skills that would help
  most with impact, effort and evidence for each, audits what is broken, duplicated or missing, and
  writes a 30-day plan to files in a grc-setup-review folder. Read-only on everything else.
category: gap-readiness
frameworks: [general, iso27001, soc2, gdpr, nis2, dora, iso42001, eu-ai-act]
tags: [onboarding, prioritisation, planning, readiness]
---

Run this first, once per setup, and again after any large change (new framework, new audit date, reorganisation). It produces four files in `./grc-setup-review/`: `inventory.md`, `top-10.md`, `audit.md` and `30-day-plan.md`. This skill drafts for a human to review and sign; this skill never marks a control effective.

## Step 1: offer the optional lookup connection

Say in one line that the skills can check framework questions with an optional specialist connection, described under Framework lookups. Offer the official setup prompt, https://docs.ismscopilot.com/agent-setup/prompt.md, and ask: set it up now, or continue without it? Continue either way; nothing below depends on the answer. If the reader says yes, open that page, tell the reader what it will do, and follow it only with their go-ahead at each step. Ask once, never again in this run.

## Step 2: load the library index

Find the library: the clone the reader points to, or the skills folder of the agent where the library was installed. If neither exists, ask before cloning the latest release tag of https://github.com/better-isms/grcskills (`git clone --branch <tag>`, never `main`) into a temporary folder. Read only the frontmatter of every `SKILL.md` under `skills/` (name, title, description, category, frameworks). Do not read the bodies yet; they cost context and the ranking does not need them. Keep the index in memory as one line per skill.

## Step 3: inspect the setup, read-only

Ask three questions first, in one message, and accept "not sure":

1. Which frameworks are in scope, and is any of them a certification, an attestation or a legal obligation?
2. When is the next external audit, customer review or regulatory deadline?
3. Who does the compliance work, and roughly how many hours a week?

Then look at what the agent can reach in the working directory and any folder the reader names: policies and procedures, risk registers, statements of applicability, asset and vendor lists, audit reports and findings, incident logs, exports from a compliance platform, tickets if the reader's own tools expose them. For each artefact record path, type, last modified date, named owner (if any) and the framework it seems to serve. Write this to `inventory.md`, with a "could not see" list at the end (systems mentioned in documents that the agent cannot open). Open documents, never configuration or secrets.

## Step 4: rank the top 10

Score every skill in the index against the inventory and the answers:

- **Impact** (1 to 3): 3 when it closes a gap that blocks the next audit, a customer deal or a legal deadline; 2 when it removes recurring manual work or a known weakness; 1 when it is good hygiene.
- **Effort** (S, M, L): S fits in a morning with what exists; M needs input from two or three people; L needs new decisions or a new process.
- **Why**: one sentence that cites a file path or an answer from step 3. No citation, no ranking.

Sort by impact, then by effort (S first), then by deadline. Cap any one category at three entries so the list covers the setup, not one theme. Write `top-10.md` as a table: rank, skill name, impact, effort, why, first action.

## Step 5: audit broken, duplicated and missing

- **Broken**: artefacts older than their review cycle (twelve months unless the document states another), with no owner, that contradict another artefact (two different retention periods, two incident severity scales), or that reference systems, teams or suppliers the rest of the material no longer mentions.
- **Duplicated**: two documents governing the same topic with different rules, two registers of the same thing, a policy restated inside a procedure that has drifted from it.
- **Missing**: an artefact the in-scope frameworks expect that the inventory does not show. Confirm each one through a framework lookup or the official text before listing it; mark it "to confirm" otherwise.

Write `audit.md` with one line per finding: type, path, what is wrong, the skill that fixes it.

## Step 6: write the 30-day plan

Turn the top 10 and the audit into at most twelve items over four weeks. Week 1 holds the S items that unblock the rest. Each item has an owner role, the skill to run, the file it produces and a definition of done a reviewer can check. Fit the plan inside the weekly hours from step 3; if it does not fit, cut items and say which ones moved out. Write `30-day-plan.md`, then summarise the result to the reader in ten lines or fewer.

If `./grc-setup-review/` already exists, ask before overwriting; offer a dated subfolder instead.

## What good looks like

- Every ranking line and every audit finding points to a file or an answer. A reader can open the path and see the same thing.
- The top 10 spans several categories and starts with work that unblocks other work, such as a scope statement or a risk method, before polish such as policy formatting.
- "Missing" claims are confirmed, not recalled. The weak version lists everything a framework might want; the strong version lists what this setup lacks for its own scope and deadline.
- The plan fits the people who will do it. A plan that needs forty hours a week from a team of one is a wish list.
- The "could not see" list is honest. An empty one on a real company usually means the agent did not look.
- A first-time reader can act on week 1 without reading anything else.

## Framework lookups

If ISMS Copilot is connected to your agent (MCP server `https://account.ismscopilot.com/v1/account/mcp`), ask it the framework question with `create_conversation` (mode `think`, `answer_format: decision`) and keep one conversation for this task. Send only a short question in your own words, show it to the user first, and never include file contents, secrets, personal data or evidence. If it is not connected, check the official text of the framework yourself; this skill does not restate it. Set it up: https://www.ismscopilot.com/mcp?ref=grcskills-grc-setup-review

## Rules

- MUST stay read-only outside `./grc-setup-review/`, and ask before overwriting anything inside it.
- MUST cite a path or an answer for every ranking and every finding.
- MUST treat the lookup connection as optional: offer it once, continue without it.
- NEVER open ~/.ssh, .env files, keychains, credential stores or configuration that holds secrets, even if they sit in the working directory.
- NEVER send inventory content, file contents or findings anywhere outside the reader's machine.
- NEVER change a compliance platform, ticket or document; recommend, and let the reader act.
- NEVER mark a control as effective or a requirement as met; the reader's people and auditors decide that.
