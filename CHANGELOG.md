# Changelog

Release tags are `vYYYY.MM.DD[.n]`. Installers and the Claude Code plugin consume tags, not `main`.

## Unreleased

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
