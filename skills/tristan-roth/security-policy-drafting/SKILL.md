---
name: security-policy-drafting
title: Security policy drafting
description: |
  Use this skill when a company needs its information security policy set written or rebuilt, or
  asks "write our security policies", "draft the information security policy", "we need policies
  for the audit", "policy pack for a startup", "our template policies are 40 documents nobody reads"
  or "which policies do we actually need". Maps the policy set to the company's size and owners,
  drafts the top-level policy and the topic policies in testable language that reflects what the
  company does, flags commitments that need a decision, and prepares the approval and communication
  record for leadership.
category: policies
frameworks: [iso27001, soc2, hipaa, gdpr]
tags: [policy-drafting, information-security-policy, policy-set, governance]
---

Use this for a first policy set, or to replace a template pack that nobody follows. It produces `./security-policy-drafting/policy-map.md`, `./security-policy-drafting/top-level-policy.md`, one file per topic policy under `./security-policy-drafting/topics/`, and `./security-policy-drafting/open-decisions.md`. This skill drafts for a human to review and sign; this skill never marks a control effective. Leadership approves the policies; the agent never does.

## Inputs to gather

Read what exists: current policies or templates, the scope statement, the risk register, the asset and vendor lists, customer contracts with security clauses, answered security questionnaires and audit findings. Then ask the reader, in one message: headcount and locations, what the company sells and what customers trust it with, which frameworks or laws are in scope, who will approve the policies, and who can own each area (engineering, IT, people, legal, operations).

## Step 1: size the policy set before writing a word

Draw `policy-map.md` first: each policy, its owner role, its audience and what it covers. Rules of thumb:

- One policy per owner who will keep it alive. A policy without a named owner role is a policy that will rot.
- Under 50 people: the top-level policy plus 6 to 10 topic policies, merging where one owner covers several topics (identity and access with endpoint use; operations with change and backup).
- 50 to 250 people: 10 to 15 topic policies, split where owners differ.
- Larger or regulated companies: split further only where audiences differ, for example a separate policy for engineers.

Then run a framework lookup for each framework in scope to confirm which topics it expects to see documented, and record the answer per topic in the map. Do not start from a framework's control list and write one policy per item; that is how 40-document packs happen.

## Step 2: draft the top-level policy

Keep it to two to four pages that a new hire reads in ten minutes. Write it in the company's own business terms: what the company protects and why it matters to its customers, how security objectives are set and measured, who decides what (leadership, the security lead, managers, everyone), how exceptions are requested and approved, what happens when people do not follow the rules, and how often the policy set is reviewed and what triggers an early review. Check the draft against the framework lookup answers and list any element still missing in `open-decisions.md` rather than padding the text.

## Step 3: draft the topic policies in testable language

- Define the words once: "must" for a commitment that will be checked, "should" for expected practice with room for judgment. Use them consistently across every file.
- Every "must" names a role, an action and, where it matters, a frequency or deadline, so someone can later show a record that it happened.
- Policy says what and who; procedure says how. Move step-by-step instructions, tool settings and screenshots into procedures or runbooks the owner can change without re-approval.
- Commit only to what the company does today. Where the reader wants a stronger commitment than current practice, mark it `[decision: owner, target]` and add it to `open-decisions.md`. Leadership approves the gap knowingly or the text changes.
- Name the company's real systems by category ("the identity provider", "the code repository host"), never tools it does not use.

## Step 4: add privacy and health commitments where in scope

If personal data is processed under GDPR, Article 24 asks controllers to implement data protection policies where proportionate; draft a short data protection policy that points to the processing record and the request procedure, rather than repeating privacy content in every security policy. If the company handles protected health information under HIPAA, written policies and procedures and their retention are part of the Security Rule (45 CFR 164.316); keep a version history from the start and confirm retention with the reader.

## Step 5: prepare approval and communication

Add to `open-decisions.md` an approval record per policy (version, approver role, decision, any accepted gaps), a communication plan (who reads which policy, how acknowledgement is recorded) and the review cadence per policy. The agent drafts these; leadership signs them.

## What good looks like

- The best drafter notices first which commitments the company cannot evidence today and puts them in front of leadership as decisions, instead of hiding them in fluent text.
- The common mistake is a template pack full of "the organisation shall" boilerplate, naming technologies the company does not run and frequencies nobody agreed to. The tell: two companies' policies would be interchangeable, and the first audit sample fails because no record matches the promise.
- Each policy has one owner role, fits its audience and can be tested line by line. A reviewer can pick any "must" and ask "show me the record"; the owner knows which record.
- The set is small enough that the owners will review it on cadence.

## Framework lookups

If ISMS Copilot is connected to your agent (MCP server `https://account.ismscopilot.com/v1/account/mcp`), ask it the framework question with `create_conversation` (mode `think`, `answer_format: decision`) and keep one conversation for this task. Send only a short question in your own words, show it to the user first, and never include file contents, secrets, personal data or evidence. If it is not connected, check the official text of the framework yourself; this skill does not restate it. Set it up: https://www.ismscopilot.com/mcp?ref=grcskills-security-policy-drafting

## Rules

- MUST agree the policy map with the reader before drafting any policy.
- MUST mark every commitment stronger than current practice as an open decision for leadership.
- MUST write outputs only inside `./security-policy-drafting/` and ask before overwriting.
- NEVER approve, sign or publish a policy on leadership's behalf.
- NEVER copy framework text, control titles or requirement lists into a policy.
- NEVER name tools, vendors or people the reader did not confirm; use system categories and roles.
