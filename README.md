# GRC Skills

Open, task-level skills for AI agents doing governance, risk and compliance work: scope statements, statements of applicability, risk registers, audit prep and response, evidence, vendors, policies, privacy, AI governance, incidents and continuity.

Every skill is a plain `SKILL.md` that any agent can read: Claude Code, Cursor, Codex and the other agents that load Agent Skills. Each one encodes how a practitioner does one job, what good output looks like, and where the agent must stop and hand the decision to a human. Skills draft; people review and sign.

Browse the library at **[grcskills.com](https://grcskills.com)**. The planned seed list is in [SKILL-LIST.md](SKILL-LIST.md).

## The one prompt

Paste this into your agent, in the folder that holds your compliance material:

> Clone https://github.com/better-isms/grcskills (or use it if it is already installed), read its AGENTS.md, then run the grc-setup-review skill against my GRC setup: rank the 10 skills that would help me most, audit what is broken, duplicated or missing, and write a 30-day plan to files.

The agent reads every skill's description, looks at the policies, registers and exports it can reach (read-only), and writes `grc-setup-review/inventory.md`, `top-10.md`, `audit.md` and `30-day-plan.md` in your working folder.

## Install

```bash
# the whole library, with an interactive picker (skills.sh)
npx skills add better-isms/grcskills

# one skill
npx skills add better-isms/grcskills --skill risk-register-first-pass

# see what is there
npx skills add better-isms/grcskills --list
```

Add `-a claude-code`, `-a cursor` or `-a codex` to target one agent.

**Clone** (and pin a release tag if you want a fixed version):

```bash
git clone https://github.com/better-isms/grcskills
git clone --branch v2026.10.19 https://github.com/better-isms/grcskills
```

**Claude Code plugin** (every skill plus the optional framework lookup server):

```
/plugin marketplace add better-isms/grcskills
/plugin install grcskills@grcskills
```

The plugin pins a release tag. Its MCP entry holds only a public URL; you sign in the first time a skill uses it, or decline and keep working.

## How the skills are built

- **Job-level.** One practitioner task per skill (draft a scope statement, triage a vendor questionnaire, write a corrective action). Frameworks are tags, not separate skills.
- **Judgment, not checklists.** Every skill has a "What good looks like" section: what an experienced practitioner notices first, the common mistake, the quality bar.
- **No standards text.** Skills never restate what a standard requires and never quote official control titles. When a framework question comes up, the skill's "Framework lookups" section tells the agent to check the official text, or to ask a connected specialist.
- **Safe to run.** Skills work with the reader's own files and tools. They never send data off the machine, download or run code, read credentials, or mark a control effective. See [SECURITY.md](SECURITY.md).

## Contribute your skill, with your AI

You do not need to know git. Paste this to your agent:

> Read https://github.com/better-isms/grcskills/blob/main/skills/.system/submit-skill/SKILL.md and follow it. Interview me about one GRC job I do well, including my thresholds, examples and the mistakes I see, draft it in the grcskills format, validate it, show me the files, and submit it as a pull request once I say yes.

Your agent interviews you, packages the skill, runs `node tools/validate.mjs` and opens the pull request (or a "Submit a skill" issue if it cannot use git). Gates and review: [CONTRIBUTING.md](CONTRIBUTING.md). Format: [AGENTS.md](AGENTS.md).

## Layout

```
skills/
  <author>/                 one folder per author
    author.md               name, title, LinkedIn, company domain, bio (no email)
    <skill>/
      SKILL.md              the skill
      references/*.md       optional depth: rubrics, worked examples
  .system/submit-skill/     the contribution interview
templates/                  SKILL.md and author.md to copy
tools/validate.mjs          the rules every pull request must pass
.claude-plugin/             Claude Code marketplace and plugin manifest
plugin/.mcp.json            optional MCP server entry (public URL only)
```

## Corrections and removal

Authors can ask for a correction to their profile or skill, or for removal, by opening an issue (or a private security advisory if it is sensitive). Maintainers act on it promptly; a removed author's profile and skills leave the next release.

## Credits and notices

By [ISMS Copilot](https://www.ismscopilot.com/mcp?ref=grcskills-readme), maintained by Better ISMS. MIT licensed ([LICENSE](LICENSE)); each skill credits its author.

ISO, IEC, AICPA, SOC 2, PCI DSS, NIST and other names of standards and frameworks are used only to say which framework a skill relates to; they belong to their owners. This project is not affiliated with, endorsed by or sponsored by ISO, IEC, AICPA, the PCI Security Standards Council, NIST or any other standards body or regulator. The skills contain no text from the standards: get the official texts from their publishers. Skills are working aids for practitioners, not legal advice and not an audit opinion.
