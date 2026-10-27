// The FAQ: one source for the visible page and its FAQPage JSON-LD, so the two
// never drift apart. Answers are plain text (no markup) because the same string
// goes into acceptedAnswer.text. A link, when there is one, renders after the
// answer and stays out of the JSON-LD. Plain, erasable TypeScript so the tests
// can import it with Node's type stripping.
//
// Every answer states something the repository or the live site says. Several
// come from questions people asked under the 2026-10-19 launch post.

export type FaqLink = { href: string; label: string };
export type FaqItem = { id: string; q: string; a: string[]; link?: FaqLink };
export type FaqGroup = { id: string; title: string; items: FaqItem[] };

const REPO = 'https://github.com/better-isms/grcskills';

export function faqGroups(tag: string, count: number): FaqGroup[] {
  return [
    {
      id: 'basics',
      title: 'The basics',
      items: [
        {
          id: 'what',
          q: 'What is grcskills?',
          a: [
            `An open library of ${count} GRC skills for AI agents. Each skill writes down how an experienced person does one piece of governance, risk and compliance work: a scope statement, a first risk register, an internal audit checklist, a vendor triage, a DPIA screening.`,
            'Your agent follows the skill on your own files and drafts the work. You make the calls.',
          ],
        },
        {
          id: 'who',
          q: 'Who is it for?',
          a: [
            'Consultants, auditors, GRC leads and anyone who keeps a compliance programme running. It is written for people who already know the work and want the gathering, drafting and cross-checking off their plate.',
          ],
        },
        {
          id: 'replace',
          q: 'Does it replace a GRC consultant or an auditor?',
          a: [
            'No. A GRC expert is paid for the calls they make, and those stay with a person: the scope, the risk you accept, what is effective, what you sign. Every skill has hard rules that stop the agent before any of those calls and hand them back to you.',
            'The skills are working aids. They are not legal advice and not an audit opinion.',
          ],
        },
        {
          id: 'cost',
          q: 'What does it cost?',
          a: [
            'Nothing. The library is MIT licensed and there is nothing to sign up for. You run it with the agent you already pay for.',
            'The optional framework lookup through ISMS Copilot works on every ISMS Copilot plan, Free included, and its questions count against that plan. Free runs fast mode only, 10 messages per 4 hours; the think mode the skills ask for needs a paid plan.',
          ],
        },
        {
          id: 'frameworks',
          q: 'Which frameworks does it cover?',
          a: [
            'Skills are tagged with the frameworks they relate to: ISO 27001, ISO 27701, ISO 42001, SOC 2, PCI DSS, GDPR, NIS 2, DORA, the EU AI Act, the Cyber Resilience Act, HIPAA, NIST CSF, NIST SP 800-53, NIST RMF, NIST SP 800-171 and CMMC, plus general skills that fit any programme.',
            'A skill is one piece of work, not one framework. A risk register skill serves ISO 27001 and SOC 2 alike.',
          ],
          link: { href: '/skills/', label: 'Browse all skills by framework' },
        },
        {
          id: 'authors',
          q: 'Who wrote the skills, and who checks them?',
          a: [
            'Each skill names its author, and every author has a page on this site. The first skills are by Tristan Roth. Before a skill goes in, a GRC specialist model challenges it: would a practising auditor follow this, does anything misstate a framework, what is missing.',
          ],
        },
        {
          id: 'affiliation',
          q: 'Is grcskills affiliated with ISO, AICPA, NIST or a regulator?',
          a: [
            'No. Framework names appear only as tags saying which framework a skill relates to, and they belong to their owners. grcskills is not affiliated with, endorsed by or sponsored by any standards body or regulator.',
          ],
        },
        {
          id: 'agents',
          q: 'Which AI agents can use it?',
          a: [
            'Claude Code, Codex, Cursor and any agent that reads SKILL.md. Every skill is a plain SKILL.md file in the Agent Skills format.',
          ],
        },
      ],
    },
    {
      id: 'start',
      title: 'Getting started',
      items: [
        {
          id: 'one-prompt',
          q: 'Where do I start?',
          a: [
            'Open your agent in the folder that holds your compliance material and paste this: "Read grcskills.com/llms.txt, then run the grc-setup-review skill on my GRC setup: rank the 10 skills that would help me most, list what is broken or missing, and write a 30-day plan."',
            'It reads your policies, registers and exports without changing them, then writes four drafts in a grc-setup-review folder: an inventory, the top 10 skills for your setup, what looks broken, duplicated or missing, and a 30-day plan. On the fictional company in the README demo, the run took about 4 minutes.',
          ],
          link: { href: `${REPO}#the-one-prompt`, label: 'See the recorded demo run' },
        },
        {
          id: 'install',
          q: 'How do I install the skills?',
          a: [
            `With the skills CLI: npx skills add better-isms/grcskills#${tag} for the whole library, or add --skill and a skill name (for example --skill risk-register-first-pass) for one skill. In Claude Code you can also run /plugin marketplace add better-isms/grcskills, then /plugin install grcskills@grcskills. Or clone the release: git clone --branch ${tag} ${REPO}.`,
            'Every install path is pinned to a release tag, never to the main branch.',
          ],
        },
        {
          id: 'no-terminal',
          q: 'I do not use a terminal. Can I still use it?',
          a: [
            'Yes. Download the skill folder from the release on GitHub and put it in your agent\'s skills folder. To publish a skill without git, your agent can file a "Submit a skill" issue instead of a pull request.',
          ],
        },
        {
          id: 'own-version',
          q: 'Can I change a skill to fit how my firm works?',
          a: [
            'Yes. The library is MIT licensed: copy it, adapt it and use it in paid client work. Keep the licence notice. If your version is better, consider publishing it under your name.',
          ],
        },
      ],
    },
    {
      id: 'data',
      title: 'Data and safety',
      items: [
        {
          id: 'confidential',
          q: 'Is it safe to run on client data?',
          a: [
            'The skills themselves send nothing anywhere, apart from the optional ISMS Copilot question, which you see first. They work on your files with your agent and write drafts in your folder.',
            'What your agent reads still goes to the AI model it runs on, so the risk is the one you already accepted for that agent. If you want to test first, run it on a copy with no client data.',
          ],
        },
        {
          id: 'edits',
          q: 'Will it change my files or my systems?',
          a: [
            'The setup review only reads your material. Each skill writes its drafts only inside its own folder (for example ./risk-register-first-pass/) and asks before overwriting anything there. No skill may write to shared systems such as compliance platforms, tickets or repositories without an explicit approval step from you.',
            'No skill marks a control effective, accepts a risk or signs anything on your behalf.',
          ],
        },
        {
          id: 'code',
          q: 'Can a skill run code or send my data to the internet?',
          a: [
            'No. A skill may never upload or send data, download or run code, read credentials or link outside an allowlist (official law, regulator and standards sites, plus this project on GitHub). The validator rejects what it can check mechanically on every pull request, and maintainers read every file before a release.',
            'The one prompt makes two network calls, both visible to you: it reads grcskills.com/llms.txt and clones the pinned release into a .grcskills folder. The optional ISMS Copilot lookup is the only other one, and you see each question first.',
            'The whole library is reviewed against the OWASP Agentic Skills Top 10 checklist, one row per check with its result, its evidence and any gap. Maintainers re-run it before each release; that step is not automated yet.',
          ],
          link: { href: `${REPO}/blob/main/reviews/security/library-security-review.md`, label: 'Read the security review' },
        },
        {
          id: 'supply-chain',
          q: 'How do you stop a bad skill from reaching me?',
          a: [
            'Installs come from release tags. Each release is immutable and carries a build provenance attestation. An outside pull request may only change its author\'s own folder, and the founder approves every outside merge.',
            'If a skill does something it should not, report it privately through a GitHub security advisory. A confirmed bad skill is reverted and a new release is cut.',
          ],
          link: { href: `${REPO}/security/advisories/new`, label: 'Report a security problem' },
        },
        {
          id: 'standards-text',
          q: 'Does it contain the text of the standards?',
          a: [
            'No. Skills never restate what a standard requires and never quote official control titles. When a framework question comes up, the skill tells the agent to check the official text, or to ask ISMS Copilot if you connected it. Get the official texts from their publishers.',
          ],
        },
      ],
    },
    {
      id: 'work',
      title: 'How the skills do the work',
      items: [
        {
          id: 'stale-evidence',
          q: 'What about stale evidence, like last year\'s screenshot?',
          a: [
            'There is a skill for exactly this. The evidence freshness check reads the date inside each artefact (the clock on the screenshot, the report header), never the file date, and flags what is stale, undated or outside the audit period. Run it four to eight weeks before fieldwork, early enough to fix gaps by running the activity.',
            'When evidence or a policy changes after a register was drafted, the since-last-run mode of the document consistency check lists which entries rest on the changed source.',
          ],
          link: { href: '/skill/evidence-freshness-check/', label: 'Evidence freshness check' },
        },
        {
          id: 'policy-change',
          q: 'When a policy changes, does anything flag what needs a second look?',
          a: [
            'Yes, when you rerun the document consistency check. In its since-last-run mode it reads the previous run, finds which documents changed (by version, approval date and the values inside them, not file dates) and lists every register entry, applicability line, policy statement and signed decision that rests on a changed fact, with the source that changed and the owner who takes the second look.',
            'Nothing runs in the background and there is no tracking service: you rerun it when a document changes and before each review cycle.',
          ],
          link: { href: '/skill/document-consistency-check/', label: 'Document consistency check' },
        },
        {
          id: 'judgment',
          q: 'Is the judgment not formed while you gather the evidence?',
          a: [
            'A lot of it is. That is why the drafts are not a summary to sign. Many skills cite the file or answer behind each finding, and the gap assessment and risk skills mark what is claimed but not evidenced, so the expert goes into the evidence where it matters.',
            'Every draft also ends with a Not checked section: what that run did not read, assumed or did not verify, so attention does not only follow the flags. Drafts someone signs end with a blank Review record: who reviewed it and on what competence, what they sampled against which source, what they changed, one item the draft did not flag that they tested, the decision and the version reviewed. The skill never fills it in. The AI draft challenge review skill is the reviewer\'s checklist for completing it.',
          ],
          link: { href: '/skill/ai-draft-challenge-review/', label: 'AI draft challenge review' },
        },
        {
          id: 'traceability',
          q: 'How do I keep the link between evidence, findings and decisions over time?',
          a: [
            'Each draft is a plain file in your folder, and many skills cite the file behind each finding. Signed drafts carry a Review record that names the version reviewed, the sources sampled and the decision, so source, finding and human decision sit in one file. Keep those files in the same version control as your evidence.',
            'When a source changes later, the since-last-run mode of the document consistency check lists the entries and recorded decisions that need a second look. grcskills does not run a tracking system of its own.',
          ],
        },
        {
          id: 'first-line',
          q: 'Some skills look like IT or IAM work. Why are they in a GRC library?',
          a: [
            'Some of them, like access review prep or restore test evidence, are first line work. They are in because GRC people often end up chasing that evidence before an audit. The skill prepares it. The owners in IT or IAM still do the review.',
          ],
        },
        {
          id: 'scanner',
          q: 'Can a skill look inside files, like a sensitive data scanner?',
          a: [
            'No. Skills never download or run code, so none ships a scanner. Some skills also stay out of the data on purpose: the health data flow mapping skill never opens patient records, even to confirm a field holds health data. It maps where health data enters, moves and rests from schemas, field names and configuration, and calls out the copies nobody designed (logs, support tickets, test databases) for an owner to check.',
            'If you already have a data discovery or scan report, the health data flow mapping and processing record skills read it and mark each data store confirmed by scan or assumed (not scanned), so the map says which rows show where data is and which show where it should be.',
          ],
          link: { href: '/skill/phi-flow-mapping/', label: 'Health data flow mapping' },
        },
      ],
    },
    {
      id: 'us',
      title: 'ISMS Copilot and updates',
      items: [
        {
          id: 'isms-copilot',
          q: 'How does grcskills relate to ISMS Copilot?',
          a: [
            'Same team. grcskills is maintained by Better ISMS, the company behind ISMS Copilot. The skills work fully without it.',
            'If you connect ISMS Copilot to your agent, a skill can ask it a framework question. The skill sends only a short question in its own words, shows it to you first, and never includes file contents, secrets, personal data or evidence.',
          ],
          link: { href: 'https://www.ismscopilot.com/mcp?ref=grcskills-faq', label: 'Connect ISMS Copilot' },
        },
        {
          id: 'connect',
          q: 'How do I connect ISMS Copilot to my AI?',
          a: [
            'Add one URL to your AI: https://account.ismscopilot.com/v1/account/mcp. In claude.ai, Claude Desktop, Claude Code and ChatGPT you sign in to ISMS Copilot and click Approve. Cursor, Codex and other clients use a personal access token you create in the ISMS Copilot app. Nothing to install.',
            'It works on every ISMS Copilot plan, Free included; Free runs fast mode only, and the think mode the skills ask for needs a paid plan. You can disconnect it any time in Settings, Connected apps.',
          ],
          link: { href: 'https://www.ismscopilot.com/mcp?ref=grcskills-faq-connect', label: 'Step-by-step setup for each AI' },
        },
        {
          id: 'updates',
          q: 'How do updates work?',
          a: [
            `Releases are dated tags such as ${tag}, and every change is in the changelog. Your install stays on the tag you chose until you install a newer one. The one prompt always reads the current release from llms.txt.`,
          ],
          link: { href: `${REPO}/blob/main/CHANGELOG.md`, label: 'Read the changelog' },
        },
        {
          id: 'wrong',
          q: 'A skill got something wrong. What do I do?',
          a: [
            'Tell us. Open an issue on GitHub with what the skill did and what it should have done. For a security problem, use a private security advisory instead.',
          ],
          link: { href: `${REPO}/issues`, label: 'Open an issue' },
        },
      ],
    },
    {
      id: 'contribute',
      title: 'Contributing',
      items: [
        {
          id: 'publish',
          q: 'Can I publish my own skill?',
          a: [
            'Yes, and it carries your name. Paste the contribution prompt into your agent: it interviews you about one GRC job you do well, drafts the skill in the library format, validates it, shows you every file and opens the pull request once you say yes.',
            'Your author page shows your name, title, LinkedIn profile and company domain, never an email address.',
          ],
          link: { href: '/contribute/', label: 'How to contribute' },
        },
        {
          id: 'removal',
          q: 'Can I correct or remove my author profile or skill later?',
          a: [
            'Yes, at any time. Open an issue, or a private security advisory if it is sensitive. A removed author\'s profile and skills leave the next release.',
          ],
        },
        {
          id: 'review',
          q: 'What happens to my skill before it goes live?',
          a: [
            'Automatic checks first, then a security review, a check that no standards text slipped in, a framework accuracy challenge and a review by a second model that did not write the skill. The founder approves every outside merge.',
          ],
        },
      ],
    },
  ];
}

export function faqLd(groups: FaqGroup[], url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url,
    inLanguage: 'en',
    mainEntity: groups.flatMap((g) => g.items).map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a.join(' ') },
    })),
  };
}
