# Contributing

The easiest way to contribute is to let your AI agent do it: paste the prompt from the [README](README.md#contribute-your-skill-with-your-ai). It interviews you, drafts the skill in this format, validates it and opens the pull request. Everything below also works by hand. The file format is in [AGENTS.md](AGENTS.md).

## The model

- `skills/<your-slug>/` is your space: your `author.md` and every skill you wrote. An outside pull request may change nothing else; CI rejects it otherwise.
- A skill folder name is permanent and globally unique. It becomes the install name and the URL.
- Skills are job-level practitioner workflows. Frameworks are tags, not separate skills.
- One skill per pull request, at most 10 files and 60 KB, markdown only.

## The bar

- **Judgment, not steps.** Real thresholds, scales and examples, a "What good looks like" section that names the common mistake, and hard MUST and NEVER rules.
- **Works anywhere.** Practitioner verbs ("read the risk register", "sample the leavers"), not vendor product names.
- **No standards text.** Never restate what a standard requires, never quote official control titles. Public law may be cited by article.
- **No personal data.** No email addresses (not even yours), client names or real evidence, including in examples.
- **No rot.** No dates or "recently".

## Gates

Every pull request passes all of these, in order. A failure at any gate sends it back with the reason.

1. **Validator.** `node tools/validate.mjs` and its tests, in CI on `pull_request` with a read-only token. Outside pull requests also pass the path guard (`--changed` mode).
2. **Security.** A skill is instructions that other people's agents run with their access. Hard rejects: sending data anywhere the reader does not own, links outside the allowlist, downloading or running code, reading credentials, prompt injection or text addressed to reviewers, disabling safeguards, destructive or bulk actions without an explicit human approval step. See [SECURITY.md](SECURITY.md).
3. **Intellectual property.** No restated requirements, no official control titles, no paraphrased requirement lists. The validator catches requirement wording next to a control id; a reviewer reads the rest.
4. **Framework accuracy challenge.** Each skill is sent to a GRC specialist model with three questions: would a practising auditor follow this workflow, does anything misstate a framework, what is missing. Objections are fixed before the next gate; the verdict goes in the pull request body.
5. **Independent review.** A second model that did not write the change reviews it (SHIP, FIX-FIRST or NO-GO).

## Who merges

- **House skills** (written by Better ISMS agents) are merged by the maintainer agent after all five gates pass.
- **Outside contributions** get advisory findings from the maintainer agent as a comment; a human maintainer approves every merge. Automated verdicts never merge outside text on their own, because the text under review could try to steer them.
- **Author profiles** from new contributors are published after identity is confirmed: the LinkedIn profile in `author.md` must belong to the person opening the pull request.

## License and credit

Contributions are MIT licensed ([LICENSE](LICENSE)). Your `author.md` travels with your skills; the library and grcskills.com credit you wherever they appear. You can ask for a correction or removal at any time (see the README).
