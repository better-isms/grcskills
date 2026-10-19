#!/usr/bin/env node
// Prebuild: read ../skills, validate, render, and write
//   .generated/content.json        the content model the pages import
//   public/search-index.json       static index for the client-side search box
//   public/llms.txt                when-to-use preamble, install, one line per skill
//   public/sitemap.xml, robots.txt
//   public/build.json              build commit SHA and release tag (release check I13)
//   public/og.png, public/og/**    Open Graph cards (scripts/og-lib.mjs), one per skill,
//                                  category and framework page
//
// Usage: node scripts/build-content.mjs [--repo <library root>]
// Env:   GRCSKILLS_BUILD_SHA (else VERCEL_GIT_COMMIT_SHA, else git HEAD)
//        GRCSKILLS_RELEASE_TAG (else the tag pinned in .claude-plugin/marketplace.json)

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadContent, ContentError, SITE_URL, REPO, REPO_URL, FRAMEWORK_LABELS, CATEGORIES, FRAMEWORKS } from './content-lib.mjs';
import { CATEGORY_INTROS, FRAMEWORK_INTROS } from './intros.mjs';
import { heroCard, skillCard, listCard, toSvg, toPng } from './og-lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(here, '..');
const argRepo = process.argv.indexOf('--repo');
const repoRoot = path.resolve(argRepo > -1 ? process.argv[argRepo + 1] : path.join(siteDir, '..'));

// The one prompt and the contribution prompt live in prompts/ at the repo root;
// README.md carries the same text (tools/validate.test.mjs checks it).
const readPrompt = (name) => fs.readFileSync(path.join(repoRoot, 'prompts', name), 'utf8').trim();
export const PROMPT = readPrompt('setup-review.txt');
export const CONTRIBUTE_PROMPT = readPrompt('contribute.txt');

// Framework pages with fewer skills than this are noindex (thin pages) and
// stay out of the sitemap until they grow.
export const FRAMEWORK_INDEX_MIN = 3;

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

// Commit dates from git, read in one pass over the history of skills/: for
// each file, the newest and the oldest commit that touched it. Unknown in a
// shallow clone (the dates would be wrong), so they are left out, not guessed.
let gitIndex;
function loadGitIndex() {
  const index = new Map();
  try {
    if (execFileSync('git', ['rev-parse', '--is-shallow-repository'], { cwd: repoRoot, encoding: 'utf8' }).trim() === 'true') return index;
    const log = execFileSync('git', ['log', '--format=%x00%cI', '--name-only', '--', 'skills'], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    for (const chunk of log.split('\0').filter(Boolean)) {
      const [date, ...files] = chunk.trim().split('\n');
      const iso = new Date(date).toISOString();
      for (const f of files.filter(Boolean)) {
        const e = index.get(f);
        if (!e) index.set(f, { newest: iso, oldest: iso });
        else e.oldest = iso; // log runs newest first
      }
    }
  } catch {
    // no git: no dates
  }
  return index;
}
function gitDate(rel, { first = false } = {}) {
  gitIndex ??= loadGitIndex();
  const hits = [...gitIndex.entries()].filter(([f]) => f === rel || f.startsWith(`${rel}/`)).map(([, e]) => (first ? e.oldest : e.newest));
  return hits.length ? hits.sort()[first ? 0 : hits.length - 1] : null;
}
const latest = (dates) => dates.filter(Boolean).sort().at(-1) ?? null;

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
    `- One skill: \`npx skills add better-isms/grcskills#${tag} --skill <skill-name>\``,
    `- The whole library, interactive: \`npx skills add better-isms/grcskills#${tag}\``,
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

export async function main() {
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

  for (const s of skills) {
    const dir = path.posix.dirname(s.repoPath);
    s.dateModified = gitDate(dir);
    s.datePublished = gitDate(s.repoPath, { first: true }) ?? s.dateModified;
    s.image = `/og/skill/${s.slug}.png`;
  }
  const allDates = latest(skills.map((s) => s.dateModified));
  for (const c of categories) {
    c.intro = CATEGORY_INTROS[c.slug] ?? '';
    c.dateModified = latest(skills.filter((s) => s.category === c.slug).map((s) => s.dateModified));
  }
  for (const f of frameworks) {
    f.intro = FRAMEWORK_INTROS[f.tag] ?? '';
    f.indexable = f.count >= FRAMEWORK_INDEX_MIN;
    f.dateModified = latest(skills.filter((s) => s.frameworks.includes(f.tag)).map((s) => s.dateModified));
  }
  for (const a of authors) a.dateModified = latest(skills.filter((s) => s.author === a.slug).map((s) => s.dateModified));
  const missing = [
    ...categories.filter((c) => c.count && !c.intro).map((c) => `category ${c.slug}`),
    ...frameworks.filter((f) => f.count && !f.intro).map((f) => `framework ${f.tag}`),
  ];
  if (missing.length) {
    console.error(`content: no intro for ${missing.join(', ')}; add one to scripts/intros.mjs`);
    process.exit(1);
  }

  const meta = {
    sha,
    tag,
    builtAt: new Date().toISOString(),
    dateModified: allDates,
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
    k: s.description,
    c: s.categoryLabel,
    f: s.frameworks.map((f) => FRAMEWORK_LABELS[f] ?? f),
    g: s.tags,
    a: authors.find((a) => a.slug === s.author)?.name ?? s.author,
  }))));

  write('public/build.json', `${JSON.stringify({ sha, tag, builtAt: meta.builtAt, skills: skills.length }, null, 2)}\n`);

  const urls = [
    ['/', allDates], ['/skills/', allDates], ['/contribute/', allDates],
    ...skills.map((s) => [`/skill/${s.slug}/`, s.dateModified]),
    ...skills.flatMap((s) => s.references.map((r) => [`/skill/${s.slug}/${r.slug}/`, s.dateModified])),
    ...authors.filter((a) => a.skills.length).map((a) => [`/${a.slug}/`, a.dateModified]),
    ...categories.filter((c) => c.count).map((c) => [`/category/${c.slug}/`, c.dateModified]),
    ...frameworks.filter((f) => f.count && f.indexable).map((f) => [`/framework/${f.tag}/`, f.dateModified]),
  ];
  write('public/sitemap.xml', [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(([u, d]) => `  <url><loc>${xmlEscape(SITE_URL + u)}</loc>${d ? `<lastmod>${d.slice(0, 10)}</lastmod>` : ''}</url>`),
    '</urlset>',
    '',
  ].join('\n'));

  await writeOgImages({ skills, categories, frameworks, tag });

  write('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  write('public/llms.txt', buildLlms({ skills, tag }));

  console.log(`content: ${skills.length} skills, ${authors.length} author${authors.length === 1 ? '' : 's'}, tag ${tag}, sha ${sha.slice(0, 12)}`);
}

// Open Graph cards: the home card at /og.png, one per skill, category and
// framework page under /og/. Text comes from validated fields only.
async function writeOgImages({ skills, categories, frameworks, tag }) {
  const png = async (rel, element) => write(`public/${rel}`, toPng(await toSvg(element, 1200, 630), 1200));
  await png('og.png', heroCard({ prompt: PROMPT }));
  for (const s of skills) {
    await png(`og/skill/${s.slug}.png`, skillCard({
      title: s.title,
      category: s.categoryLabel,
      frameworks: s.frameworks.map((f) => FRAMEWORK_LABELS[f] ?? f),
      command: `npx skills add ${REPO}#${tag} --skill ${s.slug}`,
    }));
  }
  const n = (k) => `${k} ${k === 1 ? 'skill' : 'skills'}`;
  for (const c of categories.filter((x) => x.count)) {
    await png(`og/category/${c.slug}.png`, listCard({ kind: 'Category', heading: `${c.label} skills for AI agents`, line: `${n(c.count)} in the Agent Skills format, MIT licensed` }));
  }
  for (const f of frameworks.filter((x) => x.count)) {
    await png(`og/framework/${f.tag}.png`, listCard({ kind: 'Framework tag', heading: `${f.label} agent skills`, line: `${n(f.count)} related to ${f.label}, MIT licensed` }));
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main();
