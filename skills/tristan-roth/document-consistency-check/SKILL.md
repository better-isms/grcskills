---
name: document-consistency-check
title: Document consistency check
description: |
  Use this skill when a set of policies, procedures, plans and registers has grown in pieces and
  someone asks "check our documents for contradictions", "are our policies consistent", "the
  retention periods don't match", "which severity scale is right", "harmonise our ISMS documents",
  "cross-check the incident plan against the policy" or "clean up our documentation before the
  audit". Extracts the checkable facts from every document (periods, deadlines, scales, roles,
  labels, references), finds contradictions, naming drift and broken references, proposes which
  document owns each fact, and drafts a glossary and a fix list for the owners.
summary: "A contradiction report across policies, procedures, plans and registers: mismatched retention periods, severity scales, owners and cadences."
category: policies
frameworks: [general]
tags: [consistency, documentation, retention, severity, glossary]
---

Use this before an audit, after merging two document sets (an acquisition, a second framework, a new consultant's templates), or when people quote different numbers for the same rule. You get three files in a new folder, `./document-consistency-check/`: a spreadsheet you can open in Excel listing every checkable fact your documents state (periods, scales, roles, references), quoted with its source (`facts-index.csv`); a report of every place two documents disagree, with the fix proposed for each owner (`conflicts.md`); and a short glossary that fixes one name per role and term (`glossary.md`). This skill drafts for a human to review and sign; this skill never marks a control effective. Document owners decide which version is right.

## Inputs to gather

Collect every governing document the agent can read: policies, procedures, plans, registers, the statement of applicability, contract templates and customer-facing security pages. Ask the reader, in one message: which documents are authoritative when two disagree, which are drafts or retired, and whether any contract or law sets a value the documents must follow (retention, notification deadlines).

## Step 1: extract the facts

Read the approved version of each document and record every checkable fact as a row in the facts spreadsheet (`facts-index.csv`): document, version and status, section, fact type, subject, value, quoted text. Retired documents give no owner values, but a live document that points at one is a broken reference. Put the values a contract or law fixes (retention duties, notification deadlines, contractual service windows) in a short table at the top of the conflicts report (`conflicts.md`); internal documents must match them. The fact types that carry most conflicts, in rough order:

1. **Periods and deadlines**: retention periods, revocation time for leavers, patch windows, notification deadlines, review cycles, backup retention, log retention.
2. **Scales**: incident severity levels, risk likelihood and impact scales, data classification labels, vendor criticality tiers.
3. **Roles and authority**: who approves, who owns, who is notified. Watch for synonyms (security lead, security officer, head of IT) that may or may not be the same person.
4. **References**: links to other documents, sections, tools and teams.
5. **Defined terms**: "incident", "personal data breach", "critical vendor", "production".

A typical set of 20 to 30 documents yields 300 to 800 facts. Do not summarise; quote, so the owner sees the exact wording.

## Step 2: compare and classify

Group facts by subject and compare. Classify each finding:

- **Contradiction**: two values for the same rule (logs kept 90 days in the logging procedure, 12 months in the incident plan).
- **Scale mismatch**: two scales for the same thing (four incident severities in the plan, three priorities in the ticketing workflow, with no mapping).
- **Naming drift**: the same role, label or term spelled several ways; harmless until someone asks who exactly approves.
- **Broken reference**: a pointer to a document, section, team or tool that no longer exists or was renamed.
- **Stale value**: a value that matches nothing in practice; flag it for a policy gap review against practice rather than resolving it here.

Rate each finding: high if an auditor would sample it or it touches a contract or legal deadline, medium if it changes what someone does, low if cosmetic.

## Step 3: decide the owning document

For each conflicting fact, propose one document as its owner and make the others refer to it instead of repeating the value. Rules of thumb:

- A contract or law beats every internal document; the internal value moves to match it.
- The operational document closest to the work (the backup procedure, the incident runbook) usually reflects reality, but check the actual configuration or record before choosing it.
- Scales live in one place and are referenced everywhere else. When two scales must coexist (a vendor's priority scale), write the mapping table once. Map the incident severity scale to the external clocks it triggers (customer contract notice windows, statutory breach notification), because a severity level with no link to a deadline is what an auditor probes.
- Repeated numbers are the root cause of most contradictions; every repetition removed is a future conflict prevented.

## Step 4: write the outputs

`conflicts.md`: one entry per finding with the quoted values, documents and sections, classification, rating, proposed owner document, proposed value or the question the owner must answer, and the edits needed in each other document. Order by rating. If the set includes a statement of applicability and registers, also check that every control marked applicable has a live implementing document, that the scope matches the asset inventory and org chart, and that every owner named is a real role.

`glossary.md`: one definition per term and role, with the owning document, and the list of variant spellings to replace.

After owners apply the edits, re-extract the changed sections and confirm each value now appears once, in its owner, with the other places pointing to it. This catches the common case where the owner fixes one document and the change never propagates.

## What good looks like

- The best reviewer goes straight to numbers with units and to scales, because that is where two authors writing in different years disagree, and where an auditor comparing two documents side by side will look.
- The common mistake is a style pass: harmonising fonts, headers and tone while the incident plan and the policy still give two notification deadlines. The tell: the output lists formatting fixes and no quoted values.
- The second mistake is resolving every conflict by picking the stricter value, which creates commitments nobody meets. Pick the value the owner will run, and check it against contracts and law.
- Good output lets each owner make every decision from one page, and after the edits every repeated value is either removed or points to its owner.

## Framework lookups

If ISMS Copilot is connected to your agent (MCP server `https://account.ismscopilot.com/v1/account/mcp`), ask it the framework question with `create_conversation` (mode `think`, `answer_format: decision`) and keep one conversation for this task. Send only a short question in your own words, show it to the user first, and never include file contents, secrets, personal data or evidence. If it is not connected, check the official text of the framework yourself; this skill does not restate it. Set it up: https://www.ismscopilot.com/mcp?ref=grcskills-document-consistency-check

## Rules

- MUST quote both conflicting values with document and section for every finding.
- MUST check contract and legal values before proposing which value wins.
- MUST write outputs only inside `./document-consistency-check/` and ask before overwriting.
- NEVER edit the source documents; propose the edits for each owner.
- NEVER resolve a conflict by defaulting to the stricter value without the owner's decision.
- NEVER copy personal data found in registers into the index; record the fact type and value only.
