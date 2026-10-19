// Build-time content pipeline for grcskills.com.
//
// Reads skills/<author>/author.md, skills/<author>/<skill>/SKILL.md and
// skills/<author>/<skill>/references/*.md, validates every field against a
// strict schema with length caps, and renders Markdown with raw HTML disabled
// and links allowlisted to https: and relative targets. Any violation throws,
// which fails the build (design doc, "Site rendering boundary").
//
// Contributor text is untrusted. Nothing here executes it, and nothing it
// contains reaches the page as markup except through markdown-it with
// html:false.

import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import { parseFrontmatter, summaryProblems, CATEGORIES, FRAMEWORKS, DESCRIPTION_MAX, SUMMARY_MAX } from '../../tools/validate.mjs';

export { CATEGORIES, FRAMEWORKS };

export const SITE_URL = 'https://grcskills.com';
export const REPO = 'better-isms/grcskills';
export const REPO_URL = `https://github.com/${REPO}`;

// Length caps. Title and bio follow the design doc. The description cap is
// imported from tools/validate.mjs (the Agent Skills format limit, 1024), so the
// validator and the site loader always agree.
export const CAPS = {
  title: 80,
  description: DESCRIPTION_MAX,
  summary: SUMMARY_MAX,
  bio: 600,
  authorName: 80,
  authorTitle: 160,
  tag: 40,
  referenceBytes: 60 * 1024,
  skillBytes: 60 * 1024,
};

// Display names for framework tags. Tags are factual: they say which framework
// a skill relates to.
export const FRAMEWORK_LABELS = {
  iso27001: 'ISO 27001',
  iso27701: 'ISO 27701',
  iso42001: 'ISO 42001',
  soc2: 'SOC 2',
  'pci-dss': 'PCI DSS',
  gdpr: 'GDPR',
  nis2: 'NIS 2',
  dora: 'DORA',
  'eu-ai-act': 'EU AI Act',
  cra: 'Cyber Resilience Act',
  'nist-800-171': 'NIST SP 800-171',
  cmmc: 'CMMC',
  hipaa: 'HIPAA',
  'nist-csf': 'NIST CSF',
  general: 'General',
};

// Author slugs become top-level routes (/<author-slug>/), so they must not
// shadow a site route or a generated file.
export const RESERVED_SLUGS = new Set([
  'skill', 'skills', 'category', 'categories', 'framework', 'frameworks', 'contribute', 'about',
  'search', 'api', 'llms', 'sitemap', 'robots', 'build', 'og', 'favicon', 'inline', 'static',
  'assets', 'fonts', 'legal', 'privacy', 'terms', 'security', 'admin', 'login', 'index', '404',
]);

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SKILL_KEYS = new Set(['name', 'title', 'description', 'summary', 'category', 'frameworks', 'tags', 'contributors']);
const AUTHOR_KEYS = new Set(['name', 'title', 'linkedinUrl', 'companyDomain']);
const LINKEDIN = /^https:\/\/(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]+\/?$/;
const DOMAIN = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/;
// C0 controls except tab and newline, DEL, and bidi overrides.
const CONTROL = /[\u0000-\u0008\u000b-\u001f\u007f‪-‮⁦-⁩]/;

export class ContentError extends Error {
  constructor(problems) {
    super(`content schema failed:\n${problems.map((p) => `  ${p}`).join('\n')}`);
    this.problems = problems;
  }
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

// Only https: and relative targets survive. Anything with a scheme other than
// https (javascript:, data:, vbscript:, http:, mailto:, file:), and
// protocol-relative //host links, are dropped.
export function isAllowedHref(raw) {
  const u = String(raw).trim();
  if (!u) return false;
  if (/^https:\/\/[^\s/]/i.test(u)) return true;
  if (u.startsWith('//') || u.startsWith('\\')) return false;
  // A colon before the first /, ? or # is a scheme. Relative links have none.
  const head = u.split(/[/?#]/, 1)[0];
  if (head.includes(':')) return false;
  return true;
}

const slugifyHeading = (text) =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);

// ctx: { skillSlug, skillRepoDir (repo-relative, posix), refSlugs: Set, ref }
export function createRenderer(ctx) {
  const md = new MarkdownIt({ html: false, linkify: false, typographer: false, breaks: false });
  md.disable(['image']);
  md.validateLink = isAllowedHref;

  const defaultLinkOpen =
    md.renderer.rules.link_open ?? ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));
  md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    const href = token.attrGet('href') ?? '';
    const out = resolveHref(href, ctx);
    if (!out) {
      token.attrs = [];
    } else {
      token.attrSet('href', out.href);
      if (out.external) token.attrSet('rel', 'nofollow noopener noreferrer');
    }
    return defaultLinkOpen(tokens, idx, opts, env, self);
  };

  md.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n';
  md.renderer.rules.table_close = () => '</table></div>\n';

  const used = new Set();
  md.renderer.rules.heading_open = (tokens, idx, opts, _env, self) => {
    const token = tokens[idx];
    if (token.tag === 'h2' || token.tag === 'h3') {
      const inline = tokens[idx + 1];
      let id = slugifyHeading(inline?.content ?? '') || 'section';
      let n = 2;
      const base = id;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      token.attrSet('id', id);
    }
    return self.renderToken(tokens, idx, opts);
  };

  return (src) => md.render(String(src).replace(/<!--[\s\S]*?-->/g, ''));
}

function resolveHref(href, ctx) {
  if (!isAllowedHref(href)) return null;
  if (/^https:\/\//i.test(href)) {
    let host = '';
    try { host = new URL(href).hostname; } catch { return null; }
    return { href, external: host !== 'grcskills.com' && host !== 'www.grcskills.com' };
  }
  if (href.startsWith('#')) return { href, external: false };
  // Relative to the file inside the repo.
  const [pathPart, hash = ''] = href.split('#');
  const base = ctx.ref ? path.posix.join(ctx.skillRepoDir, 'references') : ctx.skillRepoDir;
  const resolved = path.posix.normalize(path.posix.join(base, pathPart.split('?')[0]));
  if (resolved.startsWith('..') || path.posix.isAbsolute(resolved)) return null;
  const refMatch = resolved.match(/^(.+)\/references\/([a-z0-9-]+)\.md$/);
  if (refMatch && refMatch[1] === ctx.skillRepoDir && ctx.refSlugs?.has(refMatch[2])) {
    return { href: `/skill/${ctx.skillSlug}/${refMatch[2]}/${hash ? `#${hash}` : ''}`, external: false };
  }
  if (resolved === `${ctx.skillRepoDir}/SKILL.md`) {
    return { href: `/skill/${ctx.skillSlug}/${hash ? `#${hash}` : ''}`, external: false };
  }
  return { href: `${REPO_URL}/blob/${ctx.gitRef ?? 'main'}/${resolved}${hash ? `#${hash}` : ''}`, external: true };
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const isStr = (v) => typeof v === 'string';
const oneLine = (v) => isStr(v) && !/[\r\n]/.test(v);

function checkText(problems, where, field, value, max, { required = true, multiline = false } = {}) {
  if (value === undefined || value === '') {
    if (required) problems.push(`${where}: ${field}: missing`);
    return;
  }
  if (!isStr(value)) { problems.push(`${where}: ${field}: must be a string`); return; }
  if (!multiline && !oneLine(value)) problems.push(`${where}: ${field}: must be one line`);
  if (value.length > max) problems.push(`${where}: ${field}: ${value.length} characters, cap is ${max}`);
  if (CONTROL.test(value)) problems.push(`${where}: ${field}: contains control or bidi characters`);
}

export function validateSkillFrontmatter(d, { folder, where, authorSlugs }) {
  const problems = [];
  for (const k of Object.keys(d)) if (!SKILL_KEYS.has(k)) problems.push(`${where}: frontmatter: unknown key \`${k}\``);
  if (!isStr(d.name) || !KEBAB.test(d.name) || d.name.length > 54) problems.push(`${where}: name: must be kebab-case, at most 54 characters`);
  else if (d.name !== folder) problems.push(`${where}: name: "${d.name}" must equal the folder name "${folder}"`);
  checkText(problems, where, 'title', d.title, CAPS.title);
  checkText(problems, where, 'description', d.description, CAPS.description, { multiline: true });
  checkText(problems, where, 'summary', d.summary, CAPS.summary);
  if (isStr(d.summary)) for (const m of summaryProblems(d.summary)) problems.push(`${where}: summary: ${m}`);
  if (!Object.prototype.hasOwnProperty.call(CATEGORIES, d.category)) problems.push(`${where}: category: "${d.category}" is not one of ${Object.keys(CATEGORIES).join(', ')}`);
  if (!Array.isArray(d.frameworks) || d.frameworks.length === 0) problems.push(`${where}: frameworks: must be a non-empty list`);
  else for (const f of d.frameworks) if (!FRAMEWORKS.includes(f)) problems.push(`${where}: frameworks: unknown tag "${f}"`);
  if (d.tags !== undefined) {
    if (!Array.isArray(d.tags) || d.tags.length > 8) problems.push(`${where}: tags: must be a list of at most 8`);
    else for (const t of d.tags) if (!isStr(t) || !KEBAB.test(t) || t.length > CAPS.tag) problems.push(`${where}: tags: "${t}" must be kebab-case, at most ${CAPS.tag} characters`);
  }
  if (d.contributors !== undefined) {
    if (!Array.isArray(d.contributors)) problems.push(`${where}: contributors: must be a list`);
    else for (const c of d.contributors) if (!authorSlugs.has(c)) problems.push(`${where}: contributors: "${c}" has no author.md`);
  }
  return problems;
}

export function validateAuthor(d, bio, { where }) {
  const problems = [];
  for (const k of Object.keys(d)) if (!AUTHOR_KEYS.has(k)) problems.push(`${where}: frontmatter: unknown key \`${k}\` (author.md takes name, title, linkedinUrl, companyDomain; no email)`);
  checkText(problems, where, 'name', d.name, CAPS.authorName);
  checkText(problems, where, 'title', d.title, CAPS.authorTitle);
  if (!isStr(d.linkedinUrl) || !LINKEDIN.test(d.linkedinUrl)) problems.push(`${where}: linkedinUrl: must be https://www.linkedin.com/in/<handle>/`);
  if (!isStr(d.companyDomain) || !DOMAIN.test(d.companyDomain)) problems.push(`${where}: companyDomain: must be a bare domain`);
  checkText(problems, where, 'bio', bio, CAPS.bio, { multiline: true });
  return problems;
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

const initials = (name) =>
  name.split(/\s+/).filter(Boolean).map((p) => p[0]).filter((c) => /[\p{L}\p{N}]/u.test(c)).slice(0, 2).join('').toUpperCase() || '?';

// Related skills: skills in the same category come first, then skills from
// other categories; within each group, more shared framework tags rank higher
// ("general" counts only for a skill with no more specific tag). Ties keep the
// alphabetical title order. Pure, so the tests can call it.
export function relatedSkills(skill, all, n = 4) {
  const specific = (s) => s.frameworks.filter((f) => f !== 'general');
  const mine = new Set(specific(skill).length ? specific(skill) : skill.frameworks);
  return all
    .filter((o) => o.slug !== skill.slug)
    .map((o) => ({ o, score: (o.category === skill.category ? 10 : 0) + o.frameworks.filter((f) => mine.has(f)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.o.title.localeCompare(b.o.title))
    .slice(0, n)
    .map((x) => x.o.slug);
}

const titleFromRef = (raw, slug) => {
  const h = raw.match(/^#\s+(.+?)\s*#*\s*$/m);
  const t = h ? h[1] : slug.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
  return t.length > CAPS.title ? t.slice(0, CAPS.title) : t;
};

// repoRoot: the library checkout (contains skills/). Returns the content model.
export function loadContent(repoRoot, { gitRef = 'main' } = {}) {
  const skillsDir = path.join(repoRoot, 'skills');
  const problems = [];
  const authors = [];
  const skills = [];

  const authorDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.isSymbolicLink() && !e.name.startsWith('.'))
    .map((e) => e.name)
    .sort();
  const authorSlugs = new Set(authorDirs);

  for (const slug of authorDirs) {
    const where = `skills/${slug}/author.md`;
    if (!KEBAB.test(slug)) problems.push(`skills/${slug}: author slug must be kebab-case`);
    if (RESERVED_SLUGS.has(slug)) problems.push(`skills/${slug}: author slug "${slug}" is reserved by a site route`);
    const file = path.join(skillsDir, slug, 'author.md');
    if (!fs.existsSync(file)) { problems.push(`${where}: missing`); continue; }
    const fm = parseFrontmatter(fs.readFileSync(file, 'utf8'));
    if (!fm.ok) { problems.push(`${where}: frontmatter ${fm.reason}`); continue; }
    if (fm.bad.length || fm.dupes.length) problems.push(`${where}: frontmatter: malformed or duplicate keys`);
    const bio = fm.body.trim();
    problems.push(...validateAuthor(fm.data, bio, { where }));
    authors.push({
      slug,
      name: String(fm.data.name ?? ''),
      title: String(fm.data.title ?? ''),
      linkedinUrl: String(fm.data.linkedinUrl ?? ''),
      companyDomain: String(fm.data.companyDomain ?? ''),
      bio: bio.replace(/\s+/g, ' '),
      bioHtml: createRenderer({ skillSlug: '', skillRepoDir: `skills/${slug}`, refSlugs: new Set(), gitRef })(bio),
      initials: initials(String(fm.data.name ?? '')),
      skills: [],
    });
  }

  const seen = new Map();
  for (const author of authorDirs) {
    const dir = path.join(skillsDir, author);
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory() || e.isSymbolicLink()) continue;
      const slug = e.name;
      const repoDir = `skills/${author}/${slug}`;
      const where = `${repoDir}/SKILL.md`;
      const file = path.join(dir, slug, 'SKILL.md');
      if (!fs.existsSync(file)) { problems.push(`${where}: missing`); continue; }
      const raw = fs.readFileSync(file, 'utf8');
      if (Buffer.byteLength(raw) > CAPS.skillBytes) problems.push(`${where}: larger than ${CAPS.skillBytes} bytes`);
      const fm = parseFrontmatter(raw);
      if (!fm.ok) { problems.push(`${where}: frontmatter ${fm.reason}`); continue; }
      if (fm.bad.length || fm.dupes.length) problems.push(`${where}: frontmatter: malformed or duplicate keys`);
      const d = fm.data;
      problems.push(...validateSkillFrontmatter(d, { folder: slug, where, authorSlugs }));
      if (seen.has(slug)) problems.push(`${where}: slug "${slug}" already used by skills/${seen.get(slug)}/${slug}`);
      seen.set(slug, author);

      const refDir = path.join(dir, slug, 'references');
      const refFiles = fs.existsSync(refDir)
        ? fs.readdirSync(refDir, { withFileTypes: true }).filter((r) => r.isFile() && !r.isSymbolicLink() && r.name.endsWith('.md')).map((r) => r.name).sort()
        : [];
      const refSlugs = new Set();
      for (const name of refFiles) {
        const rs = name.slice(0, -3);
        if (!KEBAB.test(rs)) problems.push(`${repoDir}/references/${name}: file name must be kebab-case .md`);
        else refSlugs.add(rs);
      }
      const ctx = { skillSlug: slug, skillRepoDir: repoDir, refSlugs, gitRef };
      const references = [];
      for (const rs of refSlugs) {
        const rraw = fs.readFileSync(path.join(refDir, `${rs}.md`), 'utf8');
        if (Buffer.byteLength(rraw) > CAPS.referenceBytes) problems.push(`${repoDir}/references/${rs}.md: larger than ${CAPS.referenceBytes} bytes`);
        if (CONTROL.test(rraw.replace(/[\t\r]/g, ''))) problems.push(`${repoDir}/references/${rs}.md: contains control or bidi characters`);
        const title = titleFromRef(rraw, rs);
        // The page shows the title as its H1; drop a leading H1 from the body.
        const rbody = rraw.replace(/^\s*#\s+[^\n]*\n?/, '');
        references.push({ slug: rs, title, html: createRenderer({ ...ctx, ref: rs })(rbody), repoPath: `${repoDir}/references/${rs}.md` });
      }
      if (CONTROL.test(fm.body.replace(/[\t\r]/g, ''))) problems.push(`${where}: body contains control or bidi characters`);

      const description = isStr(d.description) ? d.description.replace(/\s+/g, ' ').trim() : '';
      skills.push({
        slug,
        author,
        title: String(d.title ?? ''),
        description,
        summary: isStr(d.summary) ? d.summary.trim() : '',
        category: String(d.category ?? ''),
        categoryLabel: CATEGORIES[d.category] ?? '',
        frameworks: Array.isArray(d.frameworks) ? d.frameworks : [],
        tags: Array.isArray(d.tags) ? d.tags : [],
        contributors: Array.isArray(d.contributors) ? d.contributors : [],
        html: createRenderer(ctx)(fm.body),
        words: fm.body.split(/\s+/).filter(Boolean).length,
        references,
        repoPath: where,
      });
    }
  }

  if (problems.length) throw new ContentError(problems);

  skills.sort((a, b) => a.title.localeCompare(b.title));
  const byAuthor = new Map(authors.map((a) => [a.slug, a]));
  for (const s of skills) byAuthor.get(s.author)?.skills.push(s.slug);
  for (const s of skills) s.related = relatedSkills(s, skills);

  const categories = Object.entries(CATEGORIES).map(([slug, label]) => ({
    slug, label, count: skills.filter((s) => s.category === slug).length,
  }));
  const frameworks = FRAMEWORKS.map((tag) => ({
    tag, label: FRAMEWORK_LABELS[tag] ?? tag, count: skills.filter((s) => s.frameworks.includes(tag)).length,
  }));

  return { authors, skills, categories, frameworks };
}
