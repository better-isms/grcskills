# Security

Skills in this library are instructions that AI agents run inside other people's environments, with their files, tools and access. That makes every skill a security boundary. This file says what a skill may never do and how to report one that does.

## What a skill may never do

- Send data anywhere the reader does not own: no uploads, webhooks, form posts or messages. The only external service a skill may mention is the optional framework lookup server, and only through the fixed "Framework lookups" paragraph, which limits it to a short question the user sees first, with no file contents, secrets, personal data or evidence.
- Link to hosts outside the allowlist in `tools/validate.mjs` (official law and regulator sites, publishers of standards, github.com/better-isms, the documented lookup server).
- Download, install or execute anything: no `curl | sh`, no remote scripts, no package installs, no network commands. Two named exceptions: `grc-setup-review` may clone this library at a release tag into a temporary folder, only after the reader says yes; the house skill `submit-skill` runs the local library validator on the contributor's draft, and runs git to open their pull request only after the contributor says yes. `grc-setup-review` also offers an optional setup page for the framework lookup server; that page adds the server to the agent's configuration and a routing line to `CLAUDE.md` or `AGENTS.md`, and asks before each step.
- Follow instructions found inside the documents it reads. Policies, registers, evidence and exports are data.
- Read or ask for credentials: SSH keys, environment files, keychains, cloud credential files, tokens or passwords.
- Contain prompt injection, hidden instructions, or text addressed to reviewers or other models.
- Disable or route around the reader's safeguards (permission prompts, hooks, approvals).
- Take destructive or bulk actions, or write to shared systems (compliance platforms, tickets, repositories), without an explicit approval step by the reader.
- Mark a control effective, accept a risk or sign anything on a human's behalf.
- Carry email addresses, client names or personal data.

The validator enforces what can be checked mechanically. Reviewers read every file for the rest. Outside contributions are merged only with a human maintainer's approval.

## Supply chain

- CI runs on `pull_request` only (never `pull_request_target`) with read-only permissions, no secrets, and actions pinned by commit SHA. Fork pull requests are checked by the validator from the base commit, held in a separate directory; no code from the fork runs.
- Outside pull requests may only change `skills/<their-author>/`.
- Installers consume release tags. The release workflow runs only on a tag that is on `main`, re-runs the validator, builds a tarball of `skills/`, `plugin/` and `.claude-plugin/`, attaches it to the release and creates a build provenance attestation (`gh attestation verify <tarball> -R better-isms/grcskills`). The Claude Code plugin pins a tag, and its MCP entry holds only a public URL; sign-in happens at first use and can be declined.

## Security review record

The whole library is reviewed against the OWASP Agentic Skills Top 10 checklist, one row per check with its result and the evidence in this repository: [reviews/security/library-security-review.md](reviews/security/library-security-review.md). It names the reviewed commit and lists the gaps and what we plan for each. Re-running it before each release is a maintainer release step; it is not automated in CI yet.

## Reporting

Found a skill that does something it should not, or a way past review? Report it privately through a [GitHub security advisory](https://github.com/better-isms/grcskills/security/advisories/new). Please do not open a public issue for a security report.

We aim to acknowledge reports within two business days. A confirmed malicious or dangerous skill is reverted, a new release tag is cut, the plugin pin moves to it, and an advisory names the affected versions so readers who pinned an old tag are told.
