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
            'The optional framework lookup through ISMS Copilot is included in every ISMS Copilot plan, Free included. Its questions count against that plan.',
          ],
        },
        {
          id: 'frameworks',
          q: 'Which frameworks does it cover?',
          a: [
            'Skills are tagged with the frameworks they relate to: ISO 27001, ISO 27701, ISO 42001, SOC 2, PCI DSS, GDPR, NIS 2, DORA, the EU AI Act, the Cyber Resilience Act, HIPAA, NIST CSF, plus general skills that fit any programme.',
            'A skill is one piece of work, not one framework. A risk register skill serves ISO 27001 and SOC 2 alike.',
          ],
          link: { href: '/skills/', label: 'Browse all skills by framework' },
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
            'The skills themselves send nothing anywhere. They work on your files with your agent and write drafts in your folder.',
            'What your agent reads still goes to the AI model it runs on, so the risk is the one you already accepted for that agent. If you want to test first, run it on a copy with no client data.',
          ],
        },
        {
          id: 'edits',
          q: 'Will it change my files or my systems?',
          a: [
            'The setup review only reads your material. Skills write their drafts as new files in your working folder. No skill may write to shared systems such as compliance platforms, tickets or repositories without an explicit approval step from you.',
            'No skill marks a control effective, accepts a risk or signs anything on your behalf.',
          ],
        },
        {
          id: 'code',
          q: 'Can a skill run code or send my data to the internet?',
          a: [
            'No. A skill may never upload or send data, download or run code, read credentials or link outside an allowlist of official sites. The validator rejects these on every pull request, and maintainers read every file before a release.',
            'The one network step is yours: the one prompt clones the pinned release from GitHub into your folder.',
          ],
          link: { href: `${REPO}/blob/main/SECURITY.md`, label: 'Read SECURITY.md' },
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
            'There is a skill for exactly this. The evidence freshness check reads the date inside each artefact (the clock on the screenshot, the report header), never the file date, and flags what is stale, undated or outside the audit period. Run it a few weeks before fieldwork.',
          ],
          link: { href: '/skill/evidence-freshness-check/', label: 'Evidence freshness check' },
        },
        {
          id: 'policy-change',
          q: 'When a policy changes, does anything flag what needs a second look?',
          a: [
            'Not automatically today. You rerun the document consistency check: it reads policies, procedures and registers side by side and lists every place two of them disagree, with a fix for each owner.',
          ],
          link: { href: '/skill/document-consistency-check/', label: 'Document consistency check' },
        },
        {
          id: 'judgment',
          q: 'Is the judgment not formed while you gather the evidence?',
          a: [
            'A lot of it is. That is why the drafts are not a summary to sign. The skills write down where each finding comes from and mark what is claimed but not evidenced, so the expert goes into the evidence where it matters.',
          ],
        },
        {
          id: 'traceability',
          q: 'How do I keep the link between evidence, findings and decisions over time?',
          a: [
            'Each draft is a plain file in your folder, and most skills write down where each finding comes from. Keep those drafts in the same version control as your evidence, and add your decision next to each one. grcskills does not run a tracking system of its own today.',
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
            'Not today. Skills never run outside tools, so there is no plug-in for a scanner. Some skills also stay out of the data on purpose: the health data flow mapping skill never opens patient records, even to confirm a field holds health data. It maps where the data should be and lists the copies nobody planned (logs, tickets, test databases) for a person to check.',
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
