#!/usr/bin/env node
// Prebuild: read ../skills, validate, render, and write
//   .generated/content.json        the content model the pages import
//   public/search-index.json       static index for the client-side search box
//   public/llms.txt                when-to-use preamble, install, one line per skill
//   public/sitemap.xml, robots.txt
//   public/build.json              build commit SHA and release tag (release check I13)
//
// Usage: node scripts/build-content.mjs [--repo <library root>]
// Env:   GRCSKILLS_BUILD_SHA (else VERCEL_GIT_COMMIT_SHA, else git HEAD)
//        GRCSKILLS_RELEASE_TAG (else the tag pinned in .claude-plugin/marketplace.json)

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadContent, ContentError, SITE_URL, REPO, REPO_URL, FRAMEWORK_LABELS, CATEGORIES, FRAMEWORKS } from './content-lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(here, '..');
const argRepo = process.argv.indexOf('--repo');
const repoRoot = path.resolve(argRepo > -1 ? process.argv[argRepo + 1] : path.join(siteDir, '..'));

export const PROMPT =
  'Clone https://github.com/better-isms/grcskills and read every SKILL.md. Then run the grc-setup-review skill on this workspace: rank the 10 skills that fit my GRC setup, list what looks broken, duplicated or missing, and write a 30-day plan to a file.';

export const CONTRIBUTE_PROMPT =
  'Read https://github.com/better-isms/grcskills/blob/main/skills/.system/submit-skill/SKILL.md and follow it. Interview me about one GRC job I do well, including my thresholds, examples and the mistakes I see, draft it in the grcskills format, validate it, show me the files, and submit it as a pull request once I say yes.';

function buildSha() {
  const fromEnv = process.env.GRCSKILLS_BUILD_SHA || process.env.VERCEL_GIT_COMMIT_SHA;
  let sha = fromEnv;
  if (!sha) {
    try { sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim(); } catch { sha = ''; }
  }
  return /^[0-9a-f]{7,40}$/.test(sha ?? '') ? sha : 'unknown';
}

function releaseTag() {
  let tag = process.env.GRCSKILLS_RELEASE_TAG;
  if (!tag) {
    try {
      const m = JSON.parse(fs.readFileSync(path.join(repoRoot, '.claude-plugin', 'marketplace.json'), 'utf8'));
      tag = m.plugins?.[0]?.source?.ref;
    } catch { tag = undefined; }
  }
  if (!tag || !/^v\d{4}\.\d{2}\.\d{2}(?:\.\d+)?$/.test(tag)) {
    throw new Error(`release tag "${tag}" is not vYYYY.MM.DD[.n]; set GRCSKILLS_RELEASE_TAG or pin it in .claude-plugin/marketplace.json`);
  }
  return tag;
}

const write = (rel, data) => {
  const file = path.join(siteDir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
};

const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// llms.txt is read by agents, so it carries no contributor prose: no title, no
// description, nothing a skill author typed. Each line is built only from the
// validated slug, the controlled category and framework vocabularies, and the
// canonical URL. A value outside those sets fails the build.
const LLMS_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function llmsSkillLine(s) {
  if (!LLMS_SLUG.test(s.slug ?? '')) throw new Error(`llms.txt: slug "${s.slug}" is not kebab-case`);
  if (!Object.hasOwn(CATEGORIES, s.category)) throw new Error(`llms.txt: ${s.slug}: unknown category`);
  if (!Array.isArray(s.frameworks) || s.frameworks.some((f) => !FRAMEWORKS.includes(f))) throw new Error(`llms.txt: ${s.slug}: unknown framework`);
  return `- ${s.slug}: ${SITE_URL}/skill/${s.slug}/ (${CATEGORIES[s.category]}; ${s.frameworks.map((f) => FRAMEWORK_LABELS[f]).join(', ')})`;
}

export function buildLlms({ skills, tag }) {
  return [
    '# grcskills',
    '',
    `> Open GRC skills for AI agents: ${skills.length} practitioner skills in the Agent Skills format (one SKILL.md each) for governance, risk and compliance work. MIT licensed, by ISMS Copilot.`,
    '',
    '## When to use',
    '',
    'Use these skills when a user asks you to do GRC work on their own files: scope statements, statements of applicability, risk registers, audit prep and response, evidence, vendors, policies, privacy, AI systems, incidents and continuity. Each skill is one practitioner job with steps, a quality bar and the files it writes. Every skill drafts for a human to review and sign; no skill marks a control effective, accepts a risk or sends data off the machine. Skills contain no text from any standard. If you do not know where to start, run grc-setup-review: it ranks the skills that fit the setup and writes a 30-day plan.',
    '',
    '## The one prompt',
    '',
    PROMPT,
    '',
    '## Install',
    '',
    '- One skill: `npx skills add better-isms/grcskills --skill <skill-name>`',
    '- The whole library, interactive: `npx skills add better-isms/grcskills`',
    '- Claude Code plugin: `/plugin marketplace add better-isms/grcskills`, then `/plugin install grcskills@grcskills`',
    `- Clone a release: \`git clone --branch ${tag} https://github.com/better-isms/grcskills\``,
    '',
    '## Skills',
    '',
    'One line per skill: skill name, page, category and frameworks. Read the SKILL.md on the page for what it does.',
    '',
    ...skills.map(llmsSkillLine),
    '',
    '## Optional',
    '',
    `- [Contribute a skill](${SITE_URL}/contribute/): interview-driven submission with your own agent`,
    `- [Repository](${REPO_URL}): AGENTS.md explains install, run and submit`,
    '',
  ].join('\n');
}

export function main() {
  const tag = releaseTag();
  const sha = buildSha();
  let content;
  try {
    content = loadContent(repoRoot, { gitRef: tag });
  } catch (e) {
    if (e instanceof ContentError) {
      console.error(e.message);
      process.exit(1);
    }
    throw e;
  }
  const { skills, authors, categories, frameworks } = content;
  if (skills.length === 0) {
    console.error('content: no skills found under skills/<author>/<skill>/SKILL.md');
    process.exit(1);
  }

  const meta = {
    sha,
    tag,
    builtAt: new Date().toISOString(),
    count: skills.length,
    prompt: PROMPT,
    contributePrompt: CONTRIBUTE_PROMPT,
    repo: REPO,
    repoUrl: REPO_URL,
    siteUrl: SITE_URL,
  };

  write('.generated/content.json', JSON.stringify({ meta, skills, authors, categories, frameworks }, null, 1));

  write('public/search-index.json', JSON.stringify(skills.map((s) => ({
    s: s.slug,
    t: s.title,
    d: s.summary,
    c: s.categoryLabel,
    f: s.frameworks.map((f) => FRAMEWORK_LABELS[f] ?? f),
    g: s.tags,
    a: authors.find((a) => a.slug === s.author)?.name ?? s.author,
  }))));

  write('public/build.json', `${JSON.stringify({ sha, tag, builtAt: meta.builtAt, skills: skills.length }, null, 2)}\n`);

  const urls = [
    '/', '/skills/', '/contribute/',
    ...skills.map((s) => `/skill/${s.slug}/`),
    ...skills.flatMap((s) => s.references.map((r) => `/skill/${s.slug}/${r.slug}/`)),
    ...authors.filter((a) => a.skills.length).map((a) => `/${a.slug}/`),
    ...categories.filter((c) => c.count).map((c) => `/category/${c.slug}/`),
    ...frameworks.filter((f) => f.count).map((f) => `/framework/${f.tag}/`),
  ];
  write('public/sitemap.xml', [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${xmlEscape(SITE_URL + u)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n'));

  write('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  write('public/llms.txt', buildLlms({ skills, tag }));

  console.log(`content: ${skills.length} skills, ${authors.length} author${authors.length === 1 ? '' : 's'}, tag ${tag}, sha ${sha.slice(0, 12)}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
