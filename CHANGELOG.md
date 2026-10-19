# Changelog

Release tags are `vYYYY.MM.DD[.n]`. Installers and the Claude Code plugin consume tags, not `main`.

## Unreleased

- llms.txt run steps: step 1 is the pinned clone only. The `npx skills add` alternative is gone from the steps (it fetched and ran an npm package the user's request did not cover); npx stays under `## Install`.
- "Where you decide" lists only rules that keep a decision or sign-off with a person (accepting, marking effective, approving, signing, deciding, sending, changing systems, routing a call to a person); rules about the quality of evidence no longer appear. The intro reads "From this skill's rules: where you decide", and the draft-only boundary sits below the list. A skill with no such rule shows the boundary alone.

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
