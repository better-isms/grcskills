#!/usr/bin/env node
// grcskills library validator. Zero dependencies, Node 20 or later.
//
//   node tools/validate.mjs                      validate the repo this file lives in
//   node tools/validate.mjs <root>               validate another checkout (tests use this)
//   node tools/validate.mjs --changed <paths...> [--author <slug>] [--root <dir>]
//                                                outside-PR path guard (use "-" to read
//                                                newline-separated paths from stdin)
//
// Output: one problem per line, written for agents and humans alike:
//   <path>: <rule>: <message, including how to fix it>
// Exit code 1 when any problem is found, 0 otherwise.
//
// Optional off-repo lists (never committed; one entry per line):
//   GRCSKILLS_BLOCKLIST=<file>         names that must never appear (e.g. client names)
//   GRCSKILLS_TITLE_DENYLIST=<file>    official control titles that must never appear

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Contract (keep in sync with AGENTS.md and templates/)
// ---------------------------------------------------------------------------

export const CATEGORIES = {
  'gap-readiness': 'Gap and readiness',
  'statement-of-applicability': 'Statement of applicability',
  risk: 'Risk',
  audit: 'Audit prep and response',
  evidence: 'Evidence',
  vendors: 'Vendors and third parties',
  policies: 'Policies and documentation',
  privacy: 'Privacy',
  'ai-systems': 'AI systems',
  'incidents-continuity': 'Incidents and continuity',
};

export const FRAMEWORKS = [
  'iso27001', 'iso27701', 'iso42001', 'soc2', 'pci-dss', 'gdpr', 'nis2', 'dora',
  'eu-ai-act', 'cra', 'nist-800-171', 'cmmc', 'hipaa', 'nist-csf', 'general',
];
// Public law: articles may be cited, with requirement wording, when the skill
// carries one of these tags.
export const PUBLIC_LAW = ['gdpr', 'nis2', 'dora', 'hipaa', 'eu-ai-act', 'cra'];

export const MIN_WORDS = 450;
export const MAX_WORDS = 1200;
// ref=grcskills-<slug> must match ^[a-z0-9][a-z0-9:._-]{0,63}$, so the slug
// gets 64 - "grcskills-".length characters.
export const MAX_SLUG = 54;

// Outside-PR limits (design doc D10 and grcskills-growth caps).
export const MAX_PR_FILES = 10;
export const MAX_PR_BYTES = 60 * 1024;

export const MCP_URL = 'https://account.ismscopilot.com/v1/account/mcp';
export const BOUNDARY_LINE =
  'drafts for a human to review and sign; this skill never marks a control effective';

export const lookupTemplate = (slug) =>
  'If ISMS Copilot is connected to your agent (MCP server ' +
  '`https://account.ismscopilot.com/v1/account/mcp`), ask it the framework question with ' +
  '`create_conversation` (mode `think`, `answer_format: decision`) and keep one conversation ' +
  'for this task. Send only a short question in your own words, show it to the user first, ' +
  'and never include file contents, secrets, personal data or evidence. If it is not connected, ' +
  'check the official text of the framework yourself; this skill does not restate it. Set it up: ' +
  `https://www.ismscopilot.com/mcp?ref=grcskills-${slug}`;

// Single named exception (design doc, Codex r1 #12): grc-setup-review step 1
// may offer the official agent setup prompt as an offer the user accepts or
// declines. No other skill may carry it.
export const SETUP_PROMPT_URL = 'https://docs.ismscopilot.com/agent-setup/prompt.md';
export const SETUP_PROMPT_SLUG = 'grc-setup-review';

// Anything that names the product, its MCP or its tools. Allowed only inside
// "## Framework lookups", which must be the exact template.
const COPILOT_MENTION = /isms\s*copilot|ismscopilot|\bcreate_conversation\b|\bsend_message\b|\bget_reply\b|\banswer_format\b|\bset_company_context\b/i;

const SKILL_KEYS = new Set(['name', 'title', 'description', 'category', 'frameworks', 'tags', 'contributors']);
const SYSTEM_KEYS = new Set(['name', 'description', 'metadata']);
const AUTHOR_KEYS = new Set(['name', 'title', 'linkedinUrl', 'companyDomain']);

// Hosts a skill may link to: exact host, or any subdomain of it.
export const ALLOWED_HOSTS = [
  // The documented MCP and its setup pages (placement is restricted further below)
  'www.ismscopilot.com', 'docs.ismscopilot.com', 'account.ismscopilot.com',
  // EU law and EU regulators
  'eur-lex.europa.eu', 'edpb.europa.eu', 'enisa.europa.eu', 'eba.europa.eu', 'esma.europa.eu',
  'eiopa.europa.eu', 'ec.europa.eu', 'commission.europa.eu',
  // National regulators and official law portals
  'cnil.fr', 'bsi.bund.de', 'aepd.es', 'garanteprivacy.it', 'autoriteitpersoonsgegevens.nl',
  'ico.org.uk', 'ncsc.gov.uk', 'legislation.gov.uk',
  'hhs.gov', 'nist.gov', 'cisa.gov', 'dodcio.defense.gov', 'ecfr.gov', 'federalregister.gov',
  // Official publishers, where the reader buys or reads the official text
  'iso.org', 'aicpa-cima.com', 'pcisecuritystandards.org',
];
// Hosts allowed only under a path prefix.
const PATH_SCOPED = [
  { host: 'github.com', prefix: '/better-isms/' },
  { host: 'raw.githubusercontent.com', prefix: '/better-isms/' },
];

// Standards-body marks never allowed in a skill's slug, name or title (marks
// appear only as factual framework tags). Whole words, any case.
const MARKS = [/\biso\b/i, /\baicpa\b/i, /\bpci\b/i, /\bnist\b/i, /\bsoc[\s-]?[123]\b/i];

const EM_DASH = '\u2014';
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;
const URL_RE = /\bhttps?:\/\/[^\s<>()[\]"'`]+/g;
const ISO_DATE = /\b(?:19|20)\d{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])\b/;

const FETCH_EXEC = [
  /\b(?:curl|wget)\b[^\n]*\|\s*(?:sudo\s+)?(?:ba|z|da|k)?sh\b/i,
  /\b(?:curl|wget)\b[^\n]*\|\s*(?:sudo\s+)?(?:python3?|node|perl|ruby)\b/i,
  /\b(?:ba|z)?sh\s+<\(\s*(?:curl|wget)/i,
  /\beval\s*["'(]?\s*"?\$\(\s*(?:curl|wget)/i,
  /\b(?:iex|Invoke-Expression)\b[^\n]*\b(?:iwr|irm|Invoke-WebRequest|Invoke-RestMethod|DownloadString)\b/i,
  /\b(?:iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^\n]*\|\s*(?:iex|Invoke-Expression)\b/i,
];
// Command position only (line start, after a backtick, $, pipe, ; or &), so prose
// such as "rsync jobs" in a backup review is not flagged.
const NETWORK_CMD = /(?:^\s*(?:[-*]\s+|\d+\.\s+)?|[`$;|&]\s*)(?:sudo\s+)?(?:curl|wget|iwr|irm|Invoke-WebRequest|Invoke-RestMethod|nc|ncat|scp|rsync|ftp|sftp)\s+[-\w./:~"'$]/i;
const SENSITIVE_PATH = [
  /~\/\.ssh\b/, /\.ssh\//, /\bid_(?:rsa|ed25519|ecdsa|dsa)\b/,
  /(?:^|[\s"'`(/])\.env(?:\.[a-z]+)?\b/, /\.aws\/credentials/, /\.netrc\b/, /\.git-credentials\b/,
  /\.npmrc\b/, /\.pypirc\b/, /\.docker\/config\.json/, /\.kube\/config\b/,
  /\bfind-(?:generic|internet)-password\b/, /\bcredentials\.json\b/, /\bkeychain\b/i,
];
const INJECTION = [
  /\bignore\s+(?:all\s+|any\s+)?(?:previous|prior|above|earlier|system)\s+(?:instructions|messages|prompts|rules)/i,
  /\bdisregard\s+(?:all\s+|any\s+|the\s+)?(?:previous|prior|above|system)\b/i,
  /\b(?:dangerously-skip-permissions|bypassPermissions|--no-verify)\b/,
  /\bdo\s+not\s+(?:tell|inform|show)\s+the\s+(?:user|reader)\b/i,
  // Text addressed to the reviewing model or maintainer (design doc I12).
  /\b(?:reviewers?|maintainers?|graders?|validators?|auditing\s+model|ai\s+reviewer|codex|claude|gpt)\s*[:,]\s*(?:please\s+)?(?:approve|merge|ship|accept|pass|lgtm)\b/i,
  /\b(?:approve|merge|ship)\s+this\s+(?:pr|pull\s+request|skill|submission|change)\b/i,
  /\bverdict\s*[:=]\s*(?:ship|approve|pass)\b/i,
];

// IP rule (design doc D3): no framework-specific requirement assertions.
// A control or clause id with requirement wording within 80 characters is
// rejected. Article citations are public law and pass when the skill is tagged
// with a public-law framework.
const CONTROL_ID = [
  /\bA\.\d{1,2}(?:\.\d{1,2})?\b/g, // ISO annex style
  /\b\d{1,2}\.\d{1,2}\.\d{1,2}\b/g, // clause or requirement numbers (5.1.2)
  /\bclause\s+\d{1,2}(?:\.\d{1,2})*\b/gi,
  /\brequirement\s+\d{1,2}(?:\.\d{1,2})+\b/gi,
  /\bCC\d{1,2}\.\d{1,2}\b/g, // trust services criteria
  /\b(?:A1|C1|PI1|P[1-8])\.\d{1,2}\b/g,
  /\b[A-Z]{2}\.L[1-3]-\d/g, // CMMC practice ids
  /\b(?:GV|ID|PR|DE|RS|RC)\.[A-Z]{2}(?:-\d{2})?\b/g, // CSF categories
];
const ARTICLE_ID = /\bArt(?:icle|\.)\s*\d{1,3}\b/gi;
const REQUIREMENT_WORD = /\b(?:requires?|required|shall|must|mandates?|mandatory|obliges?)\b/i;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const unquote = (s) => {
  const t = String(s).trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
  return t;
};

// Minimal YAML frontmatter reader: `key: value`, `key: [a, b]`, `key:` followed
// by `- item` lines or one level of `sub: value` lines, and `|` / `>` block scalars.
export function parseFrontmatter(raw) {
  const text = raw.replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) return { ok: false, reason: 'missing' };
  const m = text.slice(4).match(/^([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!m) return { ok: false, reason: 'unterminated' };
  const body = text.slice(4 + m[0].length);
  const data = {};
  const dupes = [];
  const bad = [];
  const lines = m[1].split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }
    const km = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):(?:[ \t]+(.*))?$/);
    if (!km) { bad.push(line); i++; continue; }
    const key = km[1];
    const value = (km[2] ?? '').trim();
    if (Object.prototype.hasOwnProperty.call(data, key)) dupes.push(key);
    i++;
    if (/^[|>][-+]?$/.test(value)) {
      const parts = [];
      while (i < lines.length && (/^\s/.test(lines[i]) || lines[i] === '')) { parts.push(lines[i].trim()); i++; }
      data[key] = value.startsWith('|') ? parts.join('\n').trim() : parts.filter(Boolean).join(' ');
    } else if (value === '') {
      const items = [];
      const map = {};
      let isMap = false;
      while (i < lines.length && (/^\s/.test(lines[i]) || lines[i].startsWith('- ') || lines[i] === '')) {
        const t = lines[i].trim();
        if (t.startsWith('- ')) items.push(unquote(t.slice(2)));
        else if (t) {
          const mm = t.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
          if (mm) { isMap = true; map[mm[1]] = unquote(mm[2]); } else bad.push(lines[i]);
        }
        i++;
      }
      data[key] = isMap ? map : items;
    } else if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value.slice(1, -1).split(',').map((s) => unquote(s)).filter(Boolean);
    } else {
      data[key] = unquote(value);
    }
  }
  return { ok: true, data, body, dupes, bad };
}

const walk = (dir) => {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isSymbolicLink()) out.push({ full, symlink: true });
    else if (e.isDirectory()) out.push(...walk(full));
    else out.push({ full, symlink: false });
  }
  return out;
};

// Splits a markdown body into H2 sections, ignoring headings inside code fences.
export function sections(body) {
  const out = [{ heading: null, lines: [] }];
  let fence = false;
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const h = !fence && line.match(/^##\s+(.+?)\s*$/);
    if (h) out.push({ heading: h[1], lines: [] });
    else out[out.length - 1].lines.push(line);
  }
  return out;
}

export const countWords = (body) =>
  body.replace(/<!--[\s\S]*?-->/g, ' ').split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;

const norm = (s) => s.replace(/\s+/g, ' ').trim();

function hostAllowed(url) {
  let u;
  try { u = new URL(url); } catch { return false; }
  const host = u.hostname.toLowerCase();
  if (ALLOWED_HOSTS.some((d) => host === d || host.endsWith(`.${d}`))) return true;
  return PATH_SCOPED.some((p) => host === p.host && u.pathname.startsWith(p.prefix));
}

// Returns the requirement-phrasing findings in a block of text.
export function requirementFindings(text, frameworks = []) {
  const found = [];
  const lawOk = frameworks.some((f) => PUBLIC_LAW.includes(f));
  const near = (idx, len) => REQUIREMENT_WORD.test(text.slice(Math.max(0, idx - 80), idx + len + 80));
  for (const re of CONTROL_ID) {
    for (const m of text.matchAll(re)) if (near(m.index, m[0].length)) found.push({ id: m[0], kind: 'control' });
  }
  if (!lawOk) {
    for (const m of text.matchAll(ARTICLE_ID)) if (near(m.index, m[0].length)) found.push({ id: m[0], kind: 'article' });
  }
  return found;
}

const readList = (file) => (file ? fs.readFileSync(file, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean) : []);

// ---------------------------------------------------------------------------
// Library validation
// ---------------------------------------------------------------------------

export function validate(root, opts = {}) {
  const problems = [];
  const rel = (p) => path.relative(root, p) || '.';
  const err = (p, rule, msg) => problems.push(`${path.isAbsolute(p) ? rel(p) : p}: ${rule}: ${msg}`);

  const blocklist = opts.blocklist ?? [];
  const titleDenylist = opts.titleDenylist ?? [];
  const skillsDir = path.join(root, 'skills');
  const stats = { skills: 0, authors: 0 };

  if (fs.existsSync(path.join(root, 'SKILL.md'))) {
    err('SKILL.md', 'no-root-skill', 'a SKILL.md at the repo root makes `npx skills` treat the repo as one skill and hides the library; remove it');
  }
  if (!fs.existsSync(skillsDir)) {
    err('skills', 'layout', 'the skills/ directory is missing');
    return { problems, stats };
  }

  // Text rules shared by every markdown file under skills/.
  // ctx: { kind: 'skill'|'reference'|'author'|'system', slug, frameworks, lookupRange: [start,end] }
  function scanText(file, text, ctx) {
    const lines = text.split('\n');
    const isAuthor = ctx.kind === 'author';
    lines.forEach((line, idx) => {
      const where = `${rel(file)}:${idx + 1}`;
      const neverLine = /^\s*[-*]\s+NEVER\b/.test(line);
      const inLookups = ctx.lookupRange && idx >= ctx.lookupRange[0] && idx < ctx.lookupRange[1];
      if (line.includes(EM_DASH)) err(where, 'no-em-dash', 'em dash found; use a comma, colon, period or parentheses');
      if (EMAIL.test(line)) err(where, 'no-email', 'email address found; this public repo carries no email addresses (authors are reached through GitHub)');
      if (!isAuthor && ISO_DATE.test(line)) err(where, 'no-dates', 'calendar date found; skills must not rot, describe cadence instead ("every 12 months")');
      if (!isAuthor && /\brecently\b/i.test(line)) err(where, 'no-dates', '"recently" rots; state the condition instead');
      const fetchExec = FETCH_EXEC.some((re) => re.test(line));
      if (fetchExec) err(where, 'security-fetch-execute', 'downloads and executes remote code; skills may never fetch-and-run anything');
      else if (NETWORK_CMD.test(line)) err(where, 'security-network-command', 'network command found (curl, wget, scp, nc...); skills work only with the reader\'s own tools and the documented MCP');
      if (!neverLine && SENSITIVE_PATH.some((re) => re.test(line))) {
        err(where, 'security-credentials', 'mentions a credential store (.ssh, .env, keychain...); allowed only on a "- NEVER" rule line');
      }
      if (INJECTION.some((re) => re.test(line))) err(where, 'security-injection', 'prompt-injection, reviewer-directed or safeguard-bypass text found; skills address the reader\'s agent only');
      for (const raw of line.match(URL_RE) ?? []) {
        const url = raw.replace(/[.,;:!?*_]+$/, '');
        if (isAuthor && /^https:\/\/(?:www\.)?linkedin\.com\/in\/[^/]+\/?$/.test(url)) continue;
        if (!url.startsWith('https://')) { err(where, 'url-https', `${url} is not https`); continue; }
        if (!hostAllowed(url)) { err(where, 'url-allowlist', `${url} points outside the allowlist (official law and regulator sites, github.com/better-isms, the documented MCP); see ALLOWED_HOSTS in tools/validate.mjs`); continue; }
        if (/ismscopilot\.com/i.test(new URL(url).hostname) && !isAuthor) {
          const setupOk = url === SETUP_PROMPT_URL && ctx.kind === 'skill' && ctx.slug === SETUP_PROMPT_SLUG;
          if (!inLookups && !setupOk) {
            err(where, 'copilot-url', url === SETUP_PROMPT_URL
              ? `the setup prompt URL is allowed only in ${SETUP_PROMPT_SLUG}`
              : 'ISMS Copilot URLs appear only in the "## Framework lookups" template');
          }
        }
      }
      if (!isAuthor && !inLookups) {
        const scrubbed = ctx.slug === SETUP_PROMPT_SLUG && ctx.kind === 'skill' ? line.split(SETUP_PROMPT_URL).join(' ') : line;
        if (COPILOT_MENTION.test(scrubbed)) {
          err(where, 'copilot-mention', 'ISMS Copilot, its MCP and its tool names appear only in "## Framework lookups" (exact template) and are never required');
        }
      }
      if (!isAuthor) {
        for (const f of requirementFindings(line, ctx.frameworks ?? [])) {
          err(where, 'ip-requirement-phrasing', f.kind === 'article'
            ? `requirement wording next to ${f.id}; article citations need a public-law framework tag (${PUBLIC_LAW.join(', ')})`
            : `requirement wording (requires, shall, must...) within 80 characters of ${f.id}; skills make no framework requirement assertions, point to "## Framework lookups" instead`);
        }
        for (const t of titleDenylist) {
          if (line.toLowerCase().includes(t.toLowerCase())) err(where, 'ip-control-title', 'matches an official control title from the off-repo denylist; use the bare id or describe the practice in your own words');
        }
      }
      for (const name of blocklist) {
        if (line.toLowerCase().includes(name.toLowerCase())) err(where, 'no-client-names', 'matches an entry of the off-repo blocklist; remove the identifying name');
      }
    });
  }

  function checkFrontmatterShape(file, fm) {
    if (!fm.ok) {
      err(file, 'frontmatter', fm.reason === 'missing' ? 'start the file with a --- fenced YAML block' : 'frontmatter block is not closed with a --- line');
      return false;
    }
    for (const k of new Set(fm.dupes)) err(file, 'frontmatter', `duplicate key \`${k}\`; keep exactly one`);
    for (const b of fm.bad) err(file, 'frontmatter', `cannot parse line "${b.trim()}"; use \`key: value\``);
    return true;
  }

  // ---- system skills -------------------------------------------------------
  const systemDir = path.join(skillsDir, '.system');
  if (fs.existsSync(systemDir)) {
    for (const e of fs.readdirSync(systemDir, { withFileTypes: true })) {
      const dir = path.join(systemDir, e.name);
      if (!e.isDirectory()) { err(dir, 'layout', 'only skill folders belong in skills/.system/'); continue; }
      const file = path.join(dir, 'SKILL.md');
      if (!fs.existsSync(file)) { err(dir, 'layout', 'missing SKILL.md'); continue; }
      const raw = fs.readFileSync(file, 'utf8');
      const fm = parseFrontmatter(raw);
      if (checkFrontmatterShape(file, fm)) {
        const d = fm.data;
        for (const k of Object.keys(d)) if (!SYSTEM_KEYS.has(k)) err(file, 'frontmatter', `unknown key \`${k}\`; system skills take name, description, metadata`);
        if (d.name !== e.name) err(file, 'name', `\`name\` must equal the folder name "${e.name}"`);
        if (typeof d.description !== 'string' || !/^Use this skill when\b/.test(d.description)) err(file, 'description', 'description must start with "Use this skill when"');
      }
      scanText(file, raw, { kind: 'system', slug: e.name });
      for (const f of walk(dir)) if (f.full !== file) err(f.full, 'layout', 'system skills hold one SKILL.md only');
    }
  }

  // ---- authors and skills --------------------------------------------------
  const owners = new Map();
  const authorSlugs = [];
  for (const e of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    const p = path.join(skillsDir, e.name);
    if (e.name.startsWith('.')) {
      if (e.name !== '.system') err(p, 'layout', 'hidden entries are not allowed under skills/ (only .system)');
      continue;
    }
    if (!e.isDirectory() || e.isSymbolicLink()) { err(p, 'layout', 'loose file under skills/; skills live in skills/<author>/<skill>/SKILL.md'); continue; }
    authorSlugs.push(e.name);
  }
  stats.authors = authorSlugs.length;

  for (const author of authorSlugs) {
    const authorDir = path.join(skillsDir, author);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(author)) err(authorDir, 'author-slug', `"${author}" is not kebab-case`);

    const authorMd = path.join(authorDir, 'author.md');
    if (!fs.existsSync(authorMd)) {
      err(authorDir, 'author', 'missing author.md; copy templates/author.md');
    } else {
      const raw = fs.readFileSync(authorMd, 'utf8');
      const fm = parseFrontmatter(raw);
      if (checkFrontmatterShape(authorMd, fm)) {
        const d = fm.data;
        if ('email' in d) err(authorMd, 'author-no-email', 'remove `email`; the public repo holds no email addresses (GDPR). Maintainers reach you on your GitHub PR');
        for (const k of Object.keys(d)) if (k !== 'email' && !AUTHOR_KEYS.has(k)) err(authorMd, 'author', `unknown key \`${k}\`; author.md takes name, title, linkedinUrl, companyDomain`);
        if (!d.name) err(authorMd, 'author-name', 'missing `name` (your full name)');
        if (!d.title) err(authorMd, 'author-title', 'missing `title` (role and company)');
        if (!d.linkedinUrl) err(authorMd, 'author-linkedin', 'missing `linkedinUrl` (your own profile, linkedin.com/in/<handle>)');
        else if (!/^https:\/\/(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]+\/?$/.test(d.linkedinUrl)) err(authorMd, 'author-linkedin', '`linkedinUrl` must be a personal profile: https://www.linkedin.com/in/<handle>/');
        if (!d.companyDomain) err(authorMd, 'author-domain', 'missing `companyDomain` (bare domain, e.g. example.com)');
        else if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(d.companyDomain)) err(authorMd, 'author-domain', '`companyDomain` must be a bare domain such as example.com (no protocol, no path)');
        const bioWords = countWords(fm.body);
        if (bioWords < 15) err(authorMd, 'author-bio', 'the body is your bio: write 2 to 4 sentences, person-first');
        else if (bioWords > 120) err(authorMd, 'author-bio', `bio is ${bioWords} words; keep it under 120`);
      }
      scanText(authorMd, raw, { kind: 'author' });
    }

    for (const c of fs.readdirSync(authorDir, { withFileTypes: true })) {
      const p = path.join(authorDir, c.name);
      if (c.isSymbolicLink()) { err(p, 'layout', 'symlinks are not allowed'); continue; }
      if (c.isDirectory()) { validateSkill(p, author); continue; }
      if (c.name === 'SKILL.md') err(p, 'layout', 'SKILL.md directly in an author folder; each skill needs its own folder: skills/<author>/<skill>/SKILL.md');
      else if (c.name !== 'author.md') err(p, 'layout', 'only author.md and skill folders belong in an author folder');
    }
  }

  function validateSkill(dir, author) {
    const slug = path.basename(dir);
    stats.skills++;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) err(dir, 'skill-slug', `"${slug}" is not kebab-case`);
    if (slug.length > MAX_SLUG) err(dir, 'skill-slug', `slug is ${slug.length} characters; the ref value grcskills-<slug> allows at most ${MAX_SLUG}`);
    if (MARKS.some((re) => re.test(slug.replace(/-/g, ' ')))) err(dir, 'no-marks', 'standards-body marks (ISO, AICPA, PCI, NIST, SOC 2) are not allowed in a skill slug; put them in `frameworks`');
    if (owners.has(slug)) err(dir, 'skill-slug', `"${slug}" already exists under skills/${owners.get(slug)}/; slugs are globally unique`);
    else owners.set(slug, author);

    const file = path.join(dir, 'SKILL.md');
    const raw = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    const fm = raw === null ? null : parseFrontmatter(raw);
    const frameworks = fm?.ok && Array.isArray(fm.data.frameworks) ? fm.data.frameworks : [];

    for (const f of walk(dir)) {
      const r = path.relative(dir, f.full).split(path.sep);
      if (f.symlink) { err(f.full, 'layout', 'symlinks are not allowed'); continue; }
      if (r.length === 1 && r[0] === 'SKILL.md') continue;
      if (r.length === 2 && r[0] === 'references' && /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(r[1])) {
        scanText(f.full, fs.readFileSync(f.full, 'utf8'), { kind: 'reference', slug, frameworks });
        continue;
      }
      err(f.full, 'layout', 'a skill folder holds SKILL.md and optional references/<kebab-name>.md files only (no scripts, no other files)');
    }

    if (raw === null) { err(dir, 'layout', 'missing SKILL.md; start from templates/SKILL.md'); return; }
    if (!checkFrontmatterShape(file, fm)) { scanText(file, raw, { kind: 'skill', slug, frameworks }); return; }
    const d = fm.data;

    // Locate "## Framework lookups" in file line numbers, for scanText.
    const fileLines = raw.replace(/\r\n/g, '\n').split('\n');
    const bodyOffset = fileLines.length - fm.body.split('\n').length;
    const secs = sections(fm.body);
    let lineNo = bodyOffset + secs[0].lines.length;
    let lookupRange = null;
    for (const s of secs.slice(1)) {
      const start = lineNo; // heading line index
      lineNo += 1 + s.lines.length;
      if (s.heading === 'Framework lookups') lookupRange = [start + 1, lineNo];
    }
    scanText(file, raw, { kind: 'skill', slug, frameworks, lookupRange });

    for (const k of Object.keys(d)) if (!SKILL_KEYS.has(k)) err(file, 'frontmatter', `unknown key \`${k}\`; allowed: ${[...SKILL_KEYS].join(', ')}`);
    if (!d.name) err(file, 'name', 'missing `name`; it must equal the folder name');
    else if (d.name !== slug) err(file, 'name', `\`name: ${d.name}\` must equal the folder name "${slug}"`);
    if (!d.title) err(file, 'title', 'missing `title` (sentence case display name)');
    else if (typeof d.title !== 'string' || d.title.length > 80) err(file, 'title', '`title` must be one line of at most 80 characters');
    for (const [field, value] of [['name', d.name], ['title', d.title]]) {
      if (typeof value === 'string' && MARKS.some((re) => re.test(value.replace(/-/g, ' ')))) {
        err(file, 'no-marks', `\`${field}\` contains a standards-body mark (ISO, AICPA, PCI, NIST, SOC 2); marks appear only as \`frameworks\` tags`);
      }
    }
    if (!d.description) err(file, 'description', 'missing `description`');
    else if (typeof d.description !== 'string' || !/^Use this skill when\b/.test(d.description)) err(file, 'description', 'description must start with "Use this skill when"');
    else if (d.description.length < 100 || d.description.length > 1024) err(file, 'description', `description is ${d.description.length} characters; write 100 to 1024, dense with the phrases a practitioner would say`);
    if (!d.category) err(file, 'category', `missing \`category\`; one of: ${Object.keys(CATEGORIES).join(', ')}`);
    else if (!(d.category in CATEGORIES)) err(file, 'category', `\`${d.category}\` is not a category; one of: ${Object.keys(CATEGORIES).join(', ')}`);
    if (!Array.isArray(d.frameworks) || d.frameworks.length === 0) err(file, 'frameworks', `\`frameworks\` must be a non-empty list from: ${FRAMEWORKS.join(', ')}`);
    else {
      for (const fw of d.frameworks) if (!FRAMEWORKS.includes(fw)) err(file, 'frameworks', `\`${fw}\` is not a known framework tag; use: ${FRAMEWORKS.join(', ')}`);
      if (new Set(d.frameworks).size !== d.frameworks.length) err(file, 'frameworks', 'duplicate framework tag');
    }
    if ('tags' in d && (!Array.isArray(d.tags) || d.tags.length > 8 || d.tags.some((t) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t)))) {
      err(file, 'tags', '`tags` must be a list of at most 8 kebab-case words');
    }
    if ('contributors' in d) {
      if (!Array.isArray(d.contributors)) err(file, 'contributors', '`contributors` must be a list of author slugs');
      else for (const c of d.contributors) if (!fs.existsSync(path.join(skillsDir, c, 'author.md'))) err(file, 'contributors', `contributor "${c}" has no skills/${c}/author.md`);
    }

    // Body rules.
    const body = fm.body;
    const words = countWords(body);
    if (words < MIN_WORDS) err(file, 'word-count', `body is ${words} words; the spine needs ${MIN_WORDS} to ${MAX_WORDS} (depth beyond that goes in references/)`);
    if (words > MAX_WORDS) err(file, 'word-count', `body is ${words} words; keep the spine at ${MAX_WORDS} or less and move depth to references/`);
    if (!norm(body).includes(BOUNDARY_LINE)) err(file, 'boundary-line', `add the draft-only boundary line: "This skill ${BOUNDARY_LINE}."`);

    const h2 = secs.filter((s) => s.heading);
    const find = (name) => h2.filter((s) => s.heading === name);
    for (const name of ['What good looks like', 'Framework lookups', 'Rules']) {
      if (find(name).length > 1) err(file, 'sections', `"## ${name}" appears more than once`);
    }
    const good = find('What good looks like')[0];
    if (!good) err(file, 'section-good', 'missing "## What good looks like" (the judgment: what the best practitioner notices, the common mistake, the quality bar)');
    else if (countWords(good.lines.join('\n')) < 60) err(file, 'section-good', '"## What good looks like" is too thin; give at least 60 words of real judgment');
    const lookups = find('Framework lookups')[0];
    if (!lookups) err(file, 'section-lookups', `missing "## Framework lookups"; paste the template from AGENTS.md with ref=grcskills-${slug}`);
    else if (lookups.lines.join('\n').trim() !== lookupTemplate(slug)) {
      err(file, 'section-lookups', `"## Framework lookups" must be the exact template from AGENTS.md (one paragraph, byte for byte), ending with ?ref=grcskills-${slug}`);
    }
    const rules = find('Rules')[0];
    if (!rules) err(file, 'section-rules', 'missing "## Rules" with MUST and NEVER lines at the end of the body');
    else {
      if (h2[h2.length - 1] !== rules) err(file, 'section-rules', '"## Rules" must be the last section');
      const items = rules.lines.filter((l) => /^\s*[-*]\s+/.test(l));
      if (!items.some((l) => /^\s*[-*]\s+MUST\b/.test(l)) || !items.some((l) => /^\s*[-*]\s+NEVER\b/.test(l))) err(file, 'section-rules', '"## Rules" needs at least one "- MUST" line and one "- NEVER" line');
      for (const l of items) if (!/^\s*[-*]\s+(?:MUST|NEVER)\b/.test(l)) err(file, 'section-rules', `rule "${l.trim().slice(0, 50)}" must start with MUST or NEVER`);
    }
  }

  // ---- plugin manifest -----------------------------------------------------
  const manifest = path.join(root, '.claude-plugin', 'plugin.json');
  if (fs.existsSync(manifest)) {
    let pj;
    try { pj = JSON.parse(fs.readFileSync(manifest, 'utf8')); } catch (e) { err(manifest, 'plugin', `invalid JSON: ${e.message}`); }
    if (pj) {
      const listed = new Set([].concat(pj.skills ?? []).map((s) => String(s).replace(/\/+$/, '')));
      for (const a of authorSlugs) {
        if (!listed.has(`./skills/${a}`)) err(manifest, 'plugin-skills', `add "./skills/${a}/" to \`skills\` so the Claude Code plugin exposes this author's skills`);
      }
      for (const s of listed) if (!fs.existsSync(path.join(root, s))) err(manifest, 'plugin-skills', `\`skills\` lists ${s}, which does not exist`);
      if (typeof pj.mcpServers !== 'string') err(manifest, 'plugin-mcp', '`mcpServers` must be a path to plugin/.mcp.json');
      else {
        const mcpPath = path.join(root, pj.mcpServers);
        let mcp;
        try { mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf8')); } catch (e) { err(manifest, 'plugin-mcp', `cannot read ${pj.mcpServers}: ${e.message}`); }
        for (const [name, cfg] of Object.entries(mcp?.mcpServers ?? {})) {
          if (cfg.url !== MCP_URL) err(mcpPath, 'plugin-mcp', `server "${name}" must point at ${MCP_URL} only`);
          if (['headers', 'env', 'command', 'args', 'headersHelper'].some((k) => k in cfg)) err(mcpPath, 'plugin-mcp', `server "${name}" must carry no headers, env or command; OAuth happens at first use, never a token in the repo`);
        }
      }
    }
  }

  return { problems, stats };
}

// ---------------------------------------------------------------------------
// Outside-PR path guard
// ---------------------------------------------------------------------------

// paths: repo-relative paths changed by the PR (added, modified or deleted).
// Fails when a path is outside skills/<author>/, is a symlink or binary, or
// when the PR exceeds MAX_PR_FILES files or MAX_PR_BYTES bytes.
export function checkChanged(root, paths, author) {
  const problems = [];
  const err = (p, rule, msg) => problems.push(`${p}: ${rule}: ${msg}`);
  const clean = [...new Set(paths.map((p) => p.trim().replace(/^\.\//, '')).filter(Boolean))];

  let slug = author;
  if (!slug) {
    const authors = new Set(clean.map((p) => p.match(/^skills\/([^/.][^/]*)\//)?.[1]).filter(Boolean));
    if (authors.size > 1) err('PR', 'pr-one-author', `the PR touches several author folders (${[...authors].join(', ')}); an outside PR changes one skills/<author>/ only`);
    slug = [...authors][0];
  }
  if (!slug) err('PR', 'pr-paths', 'no change under skills/<author>/; outside PRs may only add or edit their own skills');

  if (clean.length > MAX_PR_FILES) err('PR', 'pr-size', `${clean.length} files changed; an outside PR changes at most ${MAX_PR_FILES}. Split it`);

  let bytes = 0;
  for (const p of clean) {
    const segs = p.split('/');
    if (segs.includes('..') || path.isAbsolute(p)) { err(p, 'pr-paths', 'path traversal is not allowed'); continue; }
    if (!slug || !p.startsWith(`skills/${slug}/`)) {
      err(p, 'pr-paths', `outside PRs may only change skills/${slug ?? '<your-author-slug>'}/**; tools, workflows, plugin files, site and governance files are maintainer-only`);
      continue;
    }
    if (segs.length > 5) err(p, 'pr-paths', 'too deep; a skill holds SKILL.md and references/<name>.md only');
    const full = path.join(root, p);
    let st;
    try { st = fs.lstatSync(full); } catch { continue; } // deleted file: path check only
    if (st.isSymbolicLink()) { err(p, 'pr-symlink', 'symlinks are not allowed'); continue; }
    if (!st.isFile()) continue;
    bytes += st.size;
    const buf = fs.readFileSync(full);
    if (!p.endsWith('.md') || buf.includes(0)) err(p, 'pr-binary', 'only markdown text files are accepted (no binaries, scripts or other file types)');
  }
  if (bytes > MAX_PR_BYTES) err('PR', 'pr-size', `the changed files weigh ${bytes} bytes; an outside PR stays under ${MAX_PR_BYTES} bytes`);
  return { problems };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main(argv) {
  const here = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  const flag = (name) => {
    const i = argv.indexOf(name);
    return i === -1 ? undefined : argv[i + 1];
  };

  if (argv.includes('--changed')) {
    const root = path.resolve(flag('--root') ?? here);
    const author = flag('--author');
    const start = argv.indexOf('--changed') + 1;
    let list = [];
    for (let i = start; i < argv.length && !argv[i].startsWith('--'); i++) list.push(argv[i]);
    if (list.length === 1 && list[0] === '-') list = fs.readFileSync(0, 'utf8').split('\n');
    const { problems } = checkChanged(root, list, author);
    if (problems.length) {
      for (const p of problems) console.error(p);
      console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'} found in the PR paths`);
      return 1;
    }
    console.log(`ok: ${list.filter((s) => s.trim()).length} changed paths inside skills/${author ?? '<author>'}/`);
    return 0;
  }

  const positional = argv.filter((a) => !a.startsWith('--'));
  const root = path.resolve(positional[0] ?? here);
  let blocklist = [];
  let titleDenylist = [];
  try {
    blocklist = readList(process.env.GRCSKILLS_BLOCKLIST);
    titleDenylist = readList(process.env.GRCSKILLS_TITLE_DENYLIST);
  } catch (e) {
    console.error(`env: lists: cannot read an off-repo list (${e.message})`);
    return 1;
  }
  const { problems, stats } = validate(root, { blocklist, titleDenylist });
  if (problems.length) {
    for (const p of problems) console.error(p);
    console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'} found`);
    return 1;
  }
  console.log(`ok: ${stats.skills} skills by ${stats.authors} author${stats.authors === 1 ? '' : 's'}, all checks passed`);
  return 0;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) process.exit(main(process.argv.slice(2)));
