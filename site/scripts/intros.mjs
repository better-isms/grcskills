// Intros for category and framework pages: two or three factual sentences,
// written by the maintainers (not contributor text). The first sentence is
// also the page's meta description, so it stays under 160 characters.
// Framework intros say what the framework is; the skills never restate it.

export const CATEGORY_INTROS = {
  'gap-readiness':
    'Skills that show where you stand before an audit or a new framework, and what to fix first. They cover first gap assessments, scope statements, a stage 1 walk-through, NIS 2 applicability and overlaps between frameworks. If you do not know where to start, grc-setup-review ranks the whole library against your own files.',
  'statement-of-applicability':
    'Skills that draft and test the statement of applicability: which controls apply, why, who owns them and how far each is implemented. They link the statement to the risk register and check that every status is backed by records.',
  risk:
    'Skills that build and maintain the risk assessment: a written method, a first register, a hygiene review, treatment plans and acceptance memos. One checks an ICT risk framework for financial entities under DORA. Each drafts from your own material and leaves every risk decision to its owner.',
  audit:
    'Skills that prepare for internal and external audits and answer what they find. They cover the internal audit programme and checklists, auditor sampling and interviews, the management review and corrective actions for nonconformities.',
  evidence:
    'Skills that collect and check the records auditors and customers ask for. They cover access reviews, change samples, restore tests, logging and monitoring, and the request list itself, and flag stale, undated or missing evidence before anyone else does.',
  vendors:
    'Skills for third-party risk in both directions: suppliers you assess and customers who assess you. They tier suppliers, triage their questionnaires and reports, answer customer questionnaires, review DPA security annexes and keep subprocessor and DORA ICT third-party registers current.',
  policies:
    'Skills that write and maintain policies people actually follow. They draft security, acceptable use and secure development policies, run the review cycle, and check that policies agree with each other and with how the company works.',
  privacy:
    'Skills for the records and decisions data protection runs on: processing records, DPIA screening, data subject requests, notices and transfer assessments. One maps protected health information for HIPAA.',
  'ai-systems':
    'Skills that govern the AI a company builds, buys and uses. They cover an AI system inventory, EU AI Act risk classification, impact assessments, AI vendor due diligence, usage rules for staff and the scope of an AI management system.',
  'incidents-continuity':
    'Skills for the moment something breaks and the preparation before it. They cover severity triage, regulatory reporting deadlines, incident response plans, business impact analysis, tabletop exercises and post-incident reviews.',
};

export const FRAMEWORK_INTROS = {
  iso27001:
    'ISO/IEC 27001 is the international standard for an information security management system, certified by an accredited body in a two-stage audit. These skills cover the work around it: scope, risk, the statement of applicability, internal audit, evidence and management review.',
  iso27701:
    'ISO/IEC 27701 sets out a privacy information management system for organisations that act as controllers or processors of personal data. These skills cover the privacy side of a management system: processing records, applicability, subprocessors and audits.',
  iso42001:
    'ISO/IEC 42001 is the management system standard for organisations that develop, provide or use AI systems, and it can be certified. These skills cover AI inventories, impact assessments, scope, applicability and audits of an AI management system.',
  soc2:
    'SOC 2 is an attestation report by an independent CPA firm on a service organisation\'s controls, against the AICPA Trust Services Criteria. A Type 1 report covers design at a point in time; a Type 2 report covers operation over a period.',
  'pci-dss':
    'PCI DSS is the data security standard of the payment card industry, maintained by the PCI Security Standards Council. It applies to organisations that store, process or transmit cardholder data. Two skills here relate to it: access reviews and auditor sampling.',
  gdpr:
    'The GDPR (Regulation (EU) 2016/679) governs how controllers and processors handle personal data of people in the EU. These skills cover processing records, DPIA screening, data subject requests, notices, transfers, vendors and breach reporting.',
  nis2:
    'NIS 2 (Directive (EU) 2022/2555) sets cybersecurity risk management and incident reporting obligations for essential and important entities. Member states apply it through national laws. These skills start with whether it applies to you, then cover risk, evidence, incidents and suppliers.',
  dora:
    'DORA (Regulation (EU) 2022/2554) is the EU digital operational resilience act for financial entities, applying since January 2025. These skills cover ICT risk management, the register of ICT third-party arrangements, incidents, continuity testing and evidence.',
  'eu-ai-act':
    'The EU AI Act (Regulation (EU) 2024/1689) sorts AI systems by risk, prohibits some practices and sets obligations for providers and deployers. Its rules apply in stages. These skills cover inventory, classification, impact, vendors and usage rules.',
  cra:
    'The Cyber Resilience Act (Regulation (EU) 2024/2847) sets cybersecurity rules for products with digital elements sold in the EU. Its obligations apply in stages until December 2027. One skill relates to it so far: a secure development policy written from your pipeline.',
  hipaa:
    'HIPAA is the US law whose Privacy, Security and Breach Notification Rules govern protected health information. They apply to covered entities and their business associates. These skills cover health data flows, access reviews, backups, policies and incident reporting.',
  'nist-csf':
    'The NIST Cybersecurity Framework (CSF 2.0) is a voluntary framework organised around six functions: Govern, Identify, Protect, Detect, Respond and Recover. One skill relates to it so far: mapping one internal control set across several frameworks.',
  general:
    'Skills tagged General apply whatever framework you follow, because the practice is the same under ISO 27001, SOC 2 or a customer\'s own requirements. Start with grc-setup-review if you are not sure which framework skills you need.',
};

