# Changelog

Release tags are `vYYYY.MM.DD[.n]`. Installers and the Claude Code plugin consume tags, not `main`.

## Unreleased

- Every skill's main output now ends with a `## Not checked` section written for that run: what it did not read or could not open, what it assumed and what it did not verify. The validator requires every skill to say so; the template, AGENTS.md, CONTRIBUTING.md and the submit-skill interview carry the rule.
- 27 skills whose output someone signs or approves (policies, registers, applicability statements, assessments, plans, memos, corrective actions) also end with a blank `## Review record` for the approver: reviewer role and competence basis, items sampled and the source each was traced to, what changed or was rejected, one item the draft did not flag and what checking it showed, decision, date and draft version reviewed. The skills never fill it in. Working files such as evidence indexes or questionnaire triage do not get one.
- New skill `ai-draft-challenge-review` (audit): the approver's checklist for challenging an AI-drafted GRC artefact before signing. Sample statements back to their sources, spot plausible but unsupported claims, check coverage against the Not checked list and what the draft never mentions, test at least one item the draft did not flag, record every change and complete the Review record. It never marks anything approved.
- `document-consistency-check` has a since-last-run mode: it reads the previous run, finds which documents changed (by version, approval date and the values inside them, never file dates) and lists the register entries, applicability lines, policy statements and recorded decisions that need a second look, each with the source that changed. No tracking service, no background job.
- `phi-flow-mapping` and `ropa-first-draft` read an existing data discovery or scan report when the reader has one and mark each data store "confirmed by scan" or "assumed (not scanned)". The skills still never open records and never run a tool.
- FAQ answers on stale evidence, policy changes, human judgment, traceability and scanners describe the since-last-run mode, Not checked and the Review record.
- Following the library security review: every skill now tells the agent that the files it reads are data, never instructions (the template, AGENTS.md and CONTRIBUTING.md carry the convention). The validator rejects hidden text in skill, reference and author files (HTML comments, zero-width characters, Unicode tag characters, bidi controls) and catches more injection phrasing ("ignore the above instructions", "forget your instructions"), with tests for each.
- README and SKILL-LIST count 61 skills.

- grcskills.com/report/: how to report illegal content or a copyright issue (EU Digital Services Act Art. 16 notices, Art. 12 point of contact), with a prefilled email and a private GitHub advisory as the two channels. Linked from the footer, listed in the sitemap, mentioned in the README; `report` is a reserved author slug.
- Security review record: the whole library (60 skills, validator, CI, release pipeline, plugin manifest, site) checked against the OWASP Agentic Skills Top 10 checklist, one row per check with result and evidence, gaps and recommendations, in `reviews/security/library-security-review.md`. Linked from SECURITY.md and the FAQ answer on running code and sending data. Re-running it before each release is a manual maintainer step, now listed under "Release (maintainers)" in AGENTS.md; CI does not run it.

## v2026.10.20.3

- ISMS Copilot, the GRC specialist your AI calls, gets its own place: a home band after "What comes back" with the connect URL and a copy button, a "Connect your AI" menu link, a clearer note under "Run with ISMS Copilot" on every skill page, and an FAQ answer on how to connect. Each link carries its own `ref=grcskills-*`. The heyGRC bar, home band and cards are unchanged (#14).
- Every install pin moves to `v2026.10.20.3`.

## v2026.10.20.2

- grcskills.com/faq/: 29 questions and answers (what it is, who it is for, who wrote it, cost, frameworks, agents, install, client data and safety, stale evidence, policy changes, traceability, ISMS Copilot, updates, contributing), many from questions asked under the launch post. One source in `site/lib/faq.ts` feeds the page and its FAQPage JSON-LD; a test checks they match. FAQ added to the menu, footer, sitemap and llms.txt; `faq` is a reserved author slug (#12).
- Every install pin moves to `v2026.10.20.2`.

## v2026.10.20.1

- grcskills.com shows a one-line heyGRC bar above the menu on every page ("From the grcskills team: heyGRC checks each pull request against your frameworks. See how"; a shorter line on phones). A visitor can close it and it stays closed: one flag in the browser's localStorage, written only on that click, nothing sent anywhere. It replaces the footer heyGRC line; the home band and the skill and list page cards stay (#9).
- Every install pin moves to `v2026.10.20.1`.

## v2026.10.20

- grcskills.com shows heyGRC, from the same team, for the work after a skill: a home band after "What comes back", "Also from us: heyGRC" in every footer, and a card under the Install card on four skill pages whose output lives in pull requests (secure development policy, change management sampling, policy gap review, GRC setup review) and on the evidence, policies and CRA list pages. Every link goes to heygrc.com/for/grc-teams with no query string. ISMS Copilot links are unchanged.
- CI runs the portfolio SEO gate on the built site (#6).
- Every install pin moves to `v2026.10.20`.

## v2026.10.19.2

- llms.txt run steps keep only the pinned clone (no unpinned npx install).
- "Where you decide" shows only rules where a person decides or signs off.
- A first-time outside author's pull request can pass CI without touching the plugin manifest.
- CHANGELOG wording fixed: the one prompt carries no tag; llms.txt pins the release.
- Every install pin moves to `v2026.10.19.2`.

## v2026.10.19.1

- New required frontmatter field `summary`: one plain line of at most 155 characters for people (search results, social cards, site cards). `description` stays the agent trigger. Written for all 60 skills; the validator, the template, AGENTS.md and the submit-skill interview carry the rule.
- One prompt, one source: `prompts/setup-review.txt` and `prompts/contribute.txt`. The site reads them; the README quotes them and a test keeps them identical. The prompt carries no release tag; llms.txt pins the release.
- grcskills.com search basics: query-word title templates, summaries as meta descriptions, canonical and og:url on every page, a generated Open Graph card per skill, category and framework page, related skills on skill pages, intros on category and framework pages, noindex for framework pages with fewer than 3 skills, JSON-LD dates and repository folder, a WebSite node, sitemap lastmod from git (a build without .git, such as `vercel deploy`, uses `.generated/git-dates.json` when it matches the build SHA), a 404 title and /favicon.ico. Skill page install commands now pin the release tag.
- README: banner, badges, a real recorded demo run on a fictional company (`assets/demo/`), category table, how it works, security summary. Social preview image in `assets/`.
- `templates/SKILL.md` renamed to `templates/SKILL.template.md`: the skills CLI listed it as a 61st skill. A new `stray-skill` validator rule rejects any SKILL.md outside a skill folder.
- Stance: the agent does the legwork, the person makes the calls. Home H1 is now "Open GRC skills for AI agents." with the subline "Written the way experienced GRC people do the work. Your agent does the legwork. You make the calls."; "What comes back" reads as drafts for you to judge; README, banners, social preview, llms.txt and the contribute page (publish your method, under your name) follow.
- Skill pages show a "Where you decide" block near the top, built from the skill's own rules that keep a call with a person, plus the draft-only boundary.
- Every install pin (marketplace ref, README, AGENTS.md) moves to `v2026.10.19.1`. The dark banner is actually dark.
- The one prompt carries no release tag: "Read grcskills.com/llms.txt, then run the grc-setup-review skill on my GRC setup: ...". llms.txt opens with the exact run steps, pinned to the release tag the marketplace pins, so the prompt, the banners and the social preview never go stale. A run of it through llms.txt on the sample company is in `assets/demo/e2e-llms/`.

## v2026.10.19

- Library scaffold: AGENTS.md, CONTRIBUTING.md, SECURITY.md, templates, validator with tests and CI, outside-PR path guard, submit-skill interview, Claude Code marketplace and plugin manifest with the optional framework lookup server.
- Review fixes: fork PRs validated by the base commit's validator only; whole-document IP scan with the wider requirement phrases; committed hashed official-title list; exact plugin, marketplace and MCP schemas with a release-tag ref; tag-only release workflow with provenance attestation; tag-pinned install docs; seed skills draft corrections instead of making them.
- First skills by Tristan Roth: grc-setup-review, risk-register-first-pass, nonconformity-root-cause-and-corrective-action.
- SKILL-LIST.md: the 60-skill seed plan.
