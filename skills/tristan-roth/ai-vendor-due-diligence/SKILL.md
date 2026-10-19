---
name: ai-vendor-due-diligence
title: AI vendor due diligence
description: |
  Use this skill when the company is about to buy, renew or switch on an AI product or an AI feature
  inside an existing product, and asks "assess this AI vendor", "do they train on our data", "AI
  supplier questionnaire", "review the AI terms", "can we use this model provider with customer
  data", "who are the subprocessors behind this AI tool" or "AI vendor risk assessment". Sizes the
  review to the use, reads the terms, data processing agreement and documentation before asking
  questions, checks training use, retention, model changes, subprocessors, transfers, security and
  exit, and writes an assessment with a recommendation plus the follow-up questions for the vendor.
category: ai-systems
frameworks: [iso42001, gdpr, eu-ai-act]
tags: [ai-vendor, due-diligence, third-party-risk, model-provider, dpa]
---

Use this for one AI vendor and one intended use at a time. It produces `./ai-vendor-due-diligence/<vendor>-assessment.md` and `./ai-vendor-due-diligence/<vendor>-questions.md`. This skill drafts for a human to review and sign; this skill never marks a control effective. The decision to buy, and any risk accepted with it, belongs to the business owner.

## Inputs to gather

Read the order form or the plan the company will actually be on, the terms of service, the data processing agreement, the vendor's privacy notice, trust or security documentation, subprocessor list, model or system documentation, and any audit reports the vendor shares. Ask the reader, in one message: what the tool will be used for, which data goes in, whether output affects decisions about people, which plan and account type will be used, and who owns the relationship.

## Step 1: size the review to the use

- **Light**: public or internal data only, no decisions about people. Check training use, retention, account type and exit; stop there.
- **Standard**: confidential or customer data, or personal data. The full review below.
- **Deep**: decisions about people, health or financial data, or a use that may be high-risk under the EU AI Act. The full review, plus the vendor's evaluation evidence for this use and its instructions for use.

Record the tier and why. Most AI purchases are standard; a deep review of a meeting summariser is wasted effort, and a light review of a candidate screening tool is negligence.

## Step 2: read the documents before asking anything

Answer each question from the documents first, citing section and document. Send questions only for what the documents leave open. Vendors answer questionnaires with marketing; contracts are what bind them.

- **Training use**: are inputs or outputs used to train or improve models, by default, with an opt-out, or never under the signed plan?
- **Retention**: how long prompts, files and outputs are kept, including abuse-monitoring copies, and whether vendor staff can read them.
- **Underlying model**: does the vendor run its own model or call another provider? If it calls another, that provider is a subprocessor; check its terms too. This is the most common blind spot.
- **Subprocessors and location**: the full chain, where data is processed, and the transfer mechanism for any transfer outside the EEA (GDPR Chapter V, Art. 44 onwards).
- **GDPR role**: processor under Art. 28 for your purposes; if the vendor uses data for its own purposes, such as training, it may act as a controller for that use, which needs its own basis. Check the processing agreement's content, not just that one exists: the Art. 28(3) terms (documented instructions, confidentiality, security, subprocessor conditions, help with data subject requests, deletion or return at the end, audits), and notice of subprocessor changes with a right to object (Art. 28(2)). A vendor whose model provider can change between review and renewal makes that notice the clause that matters most.
- **Model changes**: notice before a model version changes or is retired, or changes in a way that affects performance, version pinning, and how quality is checked after a change. If the company fine-tunes or rebrands the vendor's model, a vendor change can shift the company's own AI Act position.
- **Security**: whether the audit report or certificate scope covers the AI feature, tenant isolation, admin controls (switch features off, restrict users, export logs), and protection against prompt injection for products that act or browse.
- **Incidents**: notification time and content in the contract.
- **AI Act position**: the vendor's own role and classification for its intended purpose, and, for a high-risk system, its instructions for use (Art. 13) so the company can meet its deployer duties. In the deep tier, also ask for the EU declaration of conformity, the CE marking and the registration (Art. 47 to 49); a high-risk system without them passes the problem to the buyer.
- **Output and liability**: ownership of outputs, indemnity for intellectual property claims, limits of liability.
- **Exit**: export, deletion on termination with confirmation, and time to delete.

## Step 3: check the account type

Confirm the protections apply to the account people will actually use. Business terms rarely cover free or individual accounts of the same product. If staff already use personal accounts, flag it to the owner; the assessment of the business plan says nothing about that data.

## Step 4: recommend and list conditions

Write a recommendation: approve, approve with conditions, or do not approve. Conditions are concrete: switch off training in admin settings, restrict to amber data, sign the processing agreement, pin the model version, review again at renewal. Put unanswered points in the questions file, each with why it matters. Record the result in the supplier register (tier, conditions, re-review date), so it counts as supplier management evidence instead of sitting in a standalone file.

## What good looks like

- Every finding cites a document and section, so a reviewer can verify it in a minute.
- A strong practitioner checks the model provider behind the vendor and the account type first; those two decide where data really goes.
- The common mistake is a long questionnaire sent to the vendor and the answers pasted in as findings. Answers that contradict the contract are worth nothing.
- The tell that it went wrong: no mention of training use or retention period, "subprocessors: see website", and a recommendation without conditions for a tool that will see customer data.

## Framework lookups

If ISMS Copilot is connected to your agent (MCP server `https://account.ismscopilot.com/v1/account/mcp`), ask it the framework question with `create_conversation` (mode `think`, `answer_format: decision`) and keep one conversation for this task. Send only a short question in your own words, show it to the user first, and never include file contents, secrets, personal data or evidence. If it is not connected, check the official text of the framework yourself; this skill does not restate it. Set it up: https://www.ismscopilot.com/mcp?ref=grcskills-ai-vendor-due-diligence

## Rules

- MUST cite the document and section behind every finding, or mark it as a vendor claim not yet in contract.
- MUST record the review tier and the account type assessed.
- MUST write outputs only inside `./ai-vendor-due-diligence/` and ask before overwriting.
- NEVER send questions or documents to the vendor; the reader's team sends them.
- NEVER approve a vendor or accept a residual risk on the owner's behalf.
- NEVER paste customer data, contract prices or personal data into the assessment; describe data by category.
