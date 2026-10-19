# Seed skill list

The 60 job-level skills planned for the launch seed, 6 per category, all credited to `tristan-roth`. Frameworks are tags; no skill is a framework copy of another. Slugs and titles carry no standards-body names.

Status: **written** means the skill is in `skills/` and passes `node tools/validate.mjs`; **planned** means not written yet. Each batch of about 10 goes through the IP check, the framework accuracy challenge and an independent second-model review before merge.

Raw material, used for the jobs and the practitioner questions only (never copied):
- **PL**: ISMS Copilot docs prompt libraries, `ismscopilot-docs/content/docs/chat/prompt-libraries/<name>.mdx` (English files).
- **UC**: ISMS Copilot marketing use-case pages, `ismscopilot.com/use-cases/<slug>`.

Excluded sources: any Probo skill text, any internal audit skill or client engagement material.

## gap-readiness (6)

| # | Slug | Title | Job | Frameworks | Source | Status |
|---|---|---|---|---|---|---|
| 1 | grc-setup-review | GRC setup review | Rank the 10 library skills that help this setup most, audit what is broken, duplicated or missing, write a 30-day plan | general, iso27001, soc2, gdpr, nis2, dora, iso42001, eu-ai-act | PL iso-27001-prompt-library-overview, grc-engineering-prompt-library-overview; UC multi-framework-compliance | written |
| 2 | scope-statement-drafting | Scope statement drafting | Draft the management system scope with boundaries, interfaces, dependencies and justified exclusions | iso27001, iso27701, iso42001 | PL iso-27001-documentation-and-reporting-prompts; UC gap-analysis-iso-27001 | written |
| 3 | first-gap-assessment | First gap assessment | Baseline what exists against a chosen framework and size the gap by effort and audit risk | general, iso27001, soc2, hipaa, nis2, iso42001 | UC gap-analysis-iso-27001, gap-analysis-soc-2, gap-analysis-hipaa, gap-analysis-nis-2, gap-analysis-iso-42001 | written |
| 4 | stage-1-readiness-walk | Stage 1 readiness walk | Walk the documentation an auditor reads first and list what would stop a certification audit from proceeding | iso27001, iso27701, iso42001 | PL iso-27001-audit-preparation-prompts (pre-audit readiness check) | written |
| 5 | multi-framework-overlap-map | Multi-framework overlap map | Map one internal control set to several frameworks so evidence is collected once | general, iso27001, soc2, nis2, nist-csf, gdpr | UC framework-mapping-iso-27001-soc-2, framework-mapping-iso-27001-nis-2, framework-mapping-nist-csf-iso-27001, framework-mapping-gdpr-ccpa | written |
| 6 | nis2-entity-applicability-check | NIS 2 entity applicability check | Decide whether the company is an essential or important entity, in which member states, and what follows | nis2 | PL nis2-directive-prompt-library | written |

## statement-of-applicability (6)

| # | Slug | Title | Job | Frameworks | Source | Status |
|---|---|---|---|---|---|---|
| 7 | soa-first-draft | Statement of applicability first draft | Build the first applicability statement from the risk treatment plan, with inclusion reasons and implementation status | iso27001 | UC soa-generation-iso-27001 | written |
| 8 | soa-exclusion-justification-review | Exclusion justification review | Test every excluded control against scope and risk and rewrite weak justifications before the auditor reads them | iso27001, iso27701, iso42001 | UC soa-generation-iso-27001; PL iso-27001-control-implementation-prompts | written |
| 9 | soa-status-reconciliation | Applicability status reconciliation | Reconcile the implementation status column with the evidence that actually exists | iso27001 | PL iso-27001-audit-preparation-prompts (evaluate control implementation evidence) | written |
| 10 | control-owner-raci | Control owner RACI | Assign an accountable owner and operators to every applicable control, with a review cadence | iso27001, soc2, general | PL iso-27001-control-implementation-prompts, soc-2-control-design-and-implementation-prompts | written |
| 11 | risk-to-control-traceability-check | Risk to control traceability check | Check that every treated risk points to controls and every applicable control traces back to a risk or obligation | iso27001, iso42001 | PL iso-27001-risk-assessment-prompts | written |
| 12 | privacy-and-ai-control-applicability | Privacy and AI control applicability | Extend the applicability statement with the additional privacy or AI management controls and their justifications | iso27701, iso42001 | PL iso-27701-privacy-management-prompt-library, iso-42001-ai-management-prompt-library | written |

## risk (6)

| # | Slug | Title | Job | Frameworks | Source | Status |
|---|---|---|---|---|---|---|
| 13 | risk-method-drafting | Risk method drafting | Draft a risk method with likelihood and impact anchors in the company's own money and hours, and an acceptance threshold | iso27001, iso27701, iso42001, dora, general | PL iso-27001-risk-assessment-prompts | written |
| 14 | risk-register-first-pass | Risk register first pass | Draft 20 to 40 company-specific risk scenarios, scored, owned and with proposed treatments | iso27001, soc2, nis2, dora, general | PL iso-27001-risk-assessment-prompts; UC risk-assessment-iso-27001, risk-assessment-nist-csf, risk-assessment-dora | written |
| 15 | risk-treatment-plan-drafting | Risk treatment plan drafting | Turn treatment decisions into actions with owners, budgets, dates and the expected residual score | iso27001, soc2, general | PL iso-27001-risk-assessment-prompts | written |
| 16 | risk-acceptance-memo | Risk acceptance memo | Draft the one-page decision record a risk owner signs to accept a residual risk, with expiry and conditions | general, iso27001, dora | PL iso-27001-risk-assessment-prompts | written |
| 17 | risk-register-hygiene-review | Risk register hygiene review | Find stale, duplicated, unowned and mis-scored risks in an existing register and propose fixes | general, iso27001, soc2 | UC risk-assessment-iso-27001; PL iso-27001-audit-preparation-prompts | written |
| 18 | ict-risk-framework-check | ICT risk framework check | Check a financial entity's ICT risk management setup against its DORA obligations and list the gaps | dora | PL dora-compliance-prompt-library; UC risk-assessment-dora | written |

## audit (6)

| # | Slug | Title | Job | Frameworks | Source | Status |
|---|---|---|---|---|---|---|
| 19 | internal-audit-programme-planning | Internal audit programme planning | Plan a risk-based internal audit programme across the cycle with auditor independence and coverage | iso27001, iso27701, iso42001, soc2 | UC internal-audits, internal-audit-iso-27001, internal-audit-soc-2 | written |
| 20 | internal-audit-checklist-from-scope | Internal audit checklist from scope | Build an audit checklist for one process from the company's own documents, with sample sizes and questions | iso27001, iso42001, gdpr, nis2, dora | UC internal-audit-iso-27001, internal-audit-gdpr, internal-audit-nis-2, internal-audit-dora, internal-audit-iso-42001 | written |
| 21 | auditor-sample-preparation | Auditor sample preparation | Prepare populations and sample-ready evidence for the samples an external auditor is likely to pull | iso27001, soc2, pci-dss | PL soc-2-audit-preparation-prompts, iso-27001-audit-preparation-prompts | written |
| 22 | auditor-interview-prep | Auditor interview prep | Brief process owners on what the auditor will ask, which records to show and how to answer what they do not know | iso27001, soc2, general | PL iso-27001-audit-preparation-prompts (auditor interview preparation) | written |
| 23 | nonconformity-root-cause-and-corrective-action | Nonconformity root cause and corrective action | Answer an audit finding with correction, root cause, extent check, actions and an effectiveness check | iso27001, iso27701, iso42001, soc2, general | PL iso-27001-audit-preparation-prompts (post-audit prompts) | written |
| 24 | management-review-pack | Management review pack | Assemble the inputs, metrics and decisions leadership needs for the management review, and draft the minutes | iso27001, iso27701, iso42001 | PL iso-27001-audit-preparation-prompts (management system evidence) | written |

## evidence (6)

| # | Slug | Title | Job | Frameworks | Source | Status |
|---|---|---|---|---|---|---|
| 25 | evidence-freshness-check | Evidence freshness check | Flag evidence that is stale, undated, unowned or outside the audit period before the auditor does | general, iso27001, soc2 | UC evidence-collection-iso-27001, evidence-collection-soc-2 | written |
| 26 | evidence-request-list-builder | Evidence request list builder | Turn an auditor's request list into owned, dated tasks with the exact artefact each one needs | iso27001, soc2, nis2, dora | UC evidence-collection-iso-27001, evidence-collection-soc-2, evidence-collection-nis-2, evidence-collection-dora | written |
| 27 | access-review-campaign-prep | Access review campaign prep | Prepare a user access review: systems, reviewers, populations, decisions to record and follow-up of removals | iso27001, soc2, hipaa, pci-dss | PL access-control-and-identity-management-prompts | written |
| 28 | change-management-evidence-sampling | Change management evidence sampling | Sample changes from the pipeline and tickets and check approval, testing and segregation evidence | soc2, iso27001 | PL devsecops-and-automation-prompts, secure-development-lifecycle-prompts | written |
| 29 | logging-and-monitoring-evidence-pack | Logging and monitoring evidence pack | Show what is logged, who reviews alerts and how a real alert was handled, with records | iso27001, soc2, nis2 | PL security-monitoring-and-incident-response-prompts, infrastructure-and-cloud-security-prompts | written |
| 30 | backup-restore-test-evidence | Backup restore test evidence | Plan and record a restore test that proves recovery within the stated objectives | iso27001, soc2, dora, hipaa | PL iso-27001-audit-preparation-prompts (backup and recovery evidence) | written |

## vendors (6)

| # | Slug | Title | Job | Frameworks | Source | Status |
|---|---|---|---|---|---|---|
| 31 | vendor-tiering | Vendor tiering | Tier suppliers by data, access and dependency so assessment effort follows risk | general, iso27001, soc2, dora, nis2 | PL iso-27001-audit-preparation-prompts (supplier evidence) | written |
| 32 | vendor-security-questionnaire-triage | Vendor security questionnaire triage | Read a supplier's completed questionnaire and reports, find the answers that matter and the follow-up questions | general, iso27001, soc2, gdpr | PL iso-27001-audit-preparation-prompts (vendor management evidence) | written |
| 33 | customer-security-questionnaire-answers | Customer security questionnaire answers | Answer an incoming customer questionnaire from the company's own documents, flagging every answer without evidence | general, soc2, iso27001, gdpr | PL soc-2-documentation-and-reporting-prompts | written |
| 34 | dpa-security-annex-review | Data processing agreement security annex review | Review the security measures annex of a processing agreement against what the company actually runs | gdpr | PL gdpr-prompt-library-overview | written |
| 35 | subprocessor-register-update | Subprocessor register update | Keep the subprocessor list complete and current, with locations, transfers and customer notice duties | gdpr, iso27701 | PL gdpr-prompt-library-overview, iso-27701-privacy-management-prompt-library | written |
| 36 | ict-third-party-register | ICT third-party register | Build or refresh the register of ICT third-party arrangements a financial entity keeps under DORA | dora | PL dora-compliance-prompt-library | written |

## policies (6)

| # | Slug | Title | Job | Frameworks | Source | Status |
|---|---|---|---|---|---|---|
| 37 | policy-gap-review-against-practice | Policy gap review against practice | Compare what a policy says with what the systems and records show, and fix the gap on the right side | general, iso27001, soc2 | UC document-consistency; PL iso-27001-policy-and-procedure-prompts | written |
| 38 | security-policy-drafting | Security policy drafting | Draft the top-level security policy and its topic policies at the size the company can actually run | iso27001, soc2, hipaa, gdpr | UC policy-generation-iso-27001, policy-generation-soc-2, policy-generation-hipaa, policy-generation-gdpr | written |
| 39 | acceptable-use-policy-drafting | Acceptable use policy drafting | Draft an acceptable use policy people read, including AI tools, personal devices and remote work | general, iso27001, soc2 | PL iso-27001-policy-and-procedure-prompts, soc-2-policy-and-procedure-prompts | written |
| 40 | policy-review-cycle-refresh | Policy review cycle refresh | Run the periodic policy review: what changed, who approves, version history, communication to staff | general, iso27001, soc2 | PL iso-27001-documentation-and-reporting-prompts | written |
| 41 | document-consistency-check | Document consistency check | Find contradictions across policies, procedures and registers (retention, severity scales, roles, review cycles) | general | UC document-consistency | written |
| 42 | secure-development-policy-from-pipeline | Secure development policy from the pipeline | Write the secure development policy from what the repositories and pipeline already enforce | iso27001, soc2, cra | PL secure-development-lifecycle-prompts, devsecops-and-automation-prompts | written |

## privacy (6)

| # | Slug | Title | Job | Frameworks | Source | Status |
|---|---|---|---|---|---|---|
| 43 | ropa-first-draft | Records of processing first draft | Draft the record of processing activities from systems, vendors and teams, with legal bases and retention | gdpr, iso27701 | PL gdpr-prompt-library-overview; UC policy-generation-gdpr | written |
| 44 | dpia-screening | DPIA screening | Decide whether a processing activity needs a data protection impact assessment and record why | gdpr, iso27701 | PL gdpr-prompt-library-overview; UC internal-audit-gdpr | written |
| 45 | data-subject-request-procedure | Data subject request procedure | Design the intake, identity check, search, response and logging for access, erasure and other requests | gdpr, iso27701 | PL gdpr-prompt-library-overview (data subject rights procedures) | written |
| 46 | privacy-notice-gap-check | Privacy notice gap check | Compare the published privacy notice with the processing records and fix what is missing or wrong | gdpr | PL gdpr-prompt-library-overview (privacy policies and notices) | written |
| 47 | transfer-impact-assessment | Transfer impact assessment | Assess a transfer of personal data outside the EEA: mechanism, destination law, supplementary measures | gdpr | PL gdpr-prompt-library-overview | written |
| 48 | phi-flow-mapping | Health data flow mapping | Map where protected health information enters, moves and rests, and which safeguards cover each flow | hipaa | PL hipaa-compliance-prompt-library; UC gap-analysis-hipaa | written |

## ai-systems (6)

| # | Slug | Title | Job | Frameworks | Source | Status |
|---|---|---|---|---|---|---|
| 49 | ai-system-inventory | AI system inventory | List every AI system the company builds, buys or uses, with owner, purpose, data and role | eu-ai-act, iso42001 | PL iso-42001-ai-management-prompt-library | written |
| 50 | ai-act-risk-classification | AI Act risk classification | Classify each AI system under the EU AI Act and record the reasoning and resulting obligations | eu-ai-act | UC risk-assessment-eu-ai-act | written |
| 51 | ai-impact-assessment | AI impact assessment | Assess the impact of one AI system on people and the company, with mitigations and sign-off | iso42001, eu-ai-act | PL iso-42001-ai-management-prompt-library; UC gap-analysis-iso-42001 | written |
| 52 | ai-acceptable-use-rules | AI acceptable use rules | Write the rules staff follow when using AI tools: approved tools, data they may enter, review of outputs | general, iso42001, eu-ai-act | UC train-ai-assistants | written |
| 53 | ai-vendor-due-diligence | AI vendor due diligence | Assess an AI supplier: training on customer data, retention, model changes, subprocessors, contractual terms | iso42001, gdpr, eu-ai-act | PL iso-42001-ai-management-prompt-library | written |
| 54 | ai-management-system-scope | AI management system scope | Draft the scope and roles of an AI management system that fits next to the security one | iso42001 | UC internal-audit-iso-42001, gap-analysis-iso-42001 | written |

## incidents-continuity (6)

| # | Slug | Title | Job | Frameworks | Source | Status |
|---|---|---|---|---|---|---|
| 55 | incident-severity-triage | Incident severity triage | Classify a live incident on the company's scale, decide who is woken up and what is recorded | general, iso27001, soc2, nis2, dora | PL security-monitoring-and-incident-response-prompts | written |
| 56 | incident-response-plan-drafting | Incident response plan drafting | Draft an incident response plan with roles, contact trees, playbooks and evidence handling | iso27001, soc2, hipaa, nis2 | PL security-monitoring-and-incident-response-prompts | written |
| 57 | regulatory-incident-reporting-clock | Regulatory incident reporting clock | Work out which authorities and customers must be told, by when, and draft the notifications for review | nis2, dora, gdpr, hipaa | PL nis2-directive-prompt-library, dora-compliance-prompt-library, gdpr-prompt-library-overview | written |
| 58 | post-incident-review | Post-incident review | Run a blameless review that ends in owned actions and updates to risks, controls and playbooks | general, iso27001, soc2 | PL security-monitoring-and-incident-response-prompts | written |
| 59 | business-impact-analysis | Business impact analysis | Set recovery objectives per service from what an outage costs, and check them against what backups and suppliers allow | iso27001, dora, nis2, general | PL infrastructure-and-cloud-security-prompts | written |
| 60 | bcp-tabletop-design | Continuity tabletop design | Design a tabletop exercise with a realistic scenario, injects, observers and a findings record | iso27001, soc2, dora, nis2 | PL security-monitoring-and-incident-response-prompts | written |

## Counts

| Category | Planned | Written |
|---|---|---|
| gap-readiness | 6 | 6 |
| statement-of-applicability | 6 | 6 |
| risk | 6 | 6 |
| audit | 6 | 6 |
| evidence | 6 | 6 |
| vendors | 6 | 6 |
| policies | 6 | 6 |
| privacy | 6 | 6 |
| ai-systems | 6 | 6 |
| incidents-continuity | 6 | 6 |
| **Total** | **60** | **60** |
