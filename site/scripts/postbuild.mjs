#!/usr/bin/env node
// Postbuild for the static export in out/.
//
// 1. CSP without 'unsafe-inline' for scripts. Next writes its RSC bootstrap as
//    inline <script> blocks (self.__next_f.push(...)). Each run of consecutive
//    inline executable scripts is moved, in place and in order, into one
//    content-addressed file under /_inline/ and replaced by a parser-blocking
//    <script src>. Execution order and position are unchanged, so the page
//    behaves the same, and the header CSP can stay `script-src 'self'`.
//    JSON-LD blocks (type="application/ld+json") are data, not script; CSP does
//    not apply to them and they stay inline.
// 2. Removes the never-linked placeholder pages a static export needs for an
//    empty dynamic segment (/skill/<slug>/_none/).
// 3. Fails if any inline executable script remains, or if a page lacks the
//    grcskills-build meta tag.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '..', process.argv[2] ?? 'out');
const inlineDir = path.join(out, '_inline');

const EXEC_TYPES = new Set(['', 'text/javascript', 'application/javascript', 'module']);
const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

const typeOf = (attrs) => (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1] ?? '').toLowerCase();
const hasSrc = (attrs) => /\bsrc\s*=/i.test(attrs);
export const isInlineExecutable = (attrs) => !hasSrc(attrs) && EXEC_TYPES.has(typeOf(attrs));

function walk(dir) {
  const files = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(p));
    else if (e.name.endsWith('.html')) files.push(p);
  }
  return files;
}

export function externalize(html, emit) {
  // Collect inline executable scripts with their spans.
  const found = [];
  for (const m of html.matchAll(SCRIPT)) {
    if (isInlineExecutable(m[1])) found.push({ start: m.index, end: m.index + m[0].length, attrs: m[1], code: m[2] });
  }
  if (!found.length) return { html, moved: 0 };
  // Group runs separated only by whitespace.
  const groups = [];
  for (const s of found) {
    const last = groups[groups.length - 1];
    if (last && /^\s*$/.test(html.slice(last.end, s.start)) && typeOf(last.attrs) === typeOf(s.attrs)) {
      last.end = s.end;
      last.code.push(s.code);
    } else {
      groups.push({ start: s.start, end: s.end, attrs: s.attrs, code: [s.code] });
    }
  }
  let outHtml = '';
  let cursor = 0;
  for (const g of groups) {
    const code = g.code.map((c) => (c.trim().endsWith(';') ? c : `${c};`)).join('\n');
    const src = emit(code);
    const type = typeOf(g.attrs) === 'module' ? ' type="module"' : '';
    outHtml += html.slice(cursor, g.start) + `<script src="${src}"${type}></script>`;
    cursor = g.end;
  }
  outHtml += html.slice(cursor);
  return { html: outHtml, moved: found.length };
}

function emitter() {
  fs.mkdirSync(inlineDir, { recursive: true });
  return (code) => {
    const hash = crypto.createHash('sha256').update(code).digest('hex').slice(0, 20);
    const file = path.join(inlineDir, `${hash}.js`);
    if (!fs.existsSync(file)) fs.writeFileSync(file, code);
    return `/_inline/${hash}.js`;
  };
}

export function main() {
  if (!fs.existsSync(out)) {
    console.error(`postbuild: ${out} does not exist; run next build first`);
    process.exit(1);
  }
  // 2. placeholders
  const skillDir = path.join(out, 'skill');
  if (fs.existsSync(skillDir)) {
    for (const s of fs.readdirSync(skillDir)) {
      const p = path.join(skillDir, s, '_none');
      if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
    }
  }

  // 1. externalize
  const emit = emitter();
  const problems = [];
  let pages = 0;
  let moved = 0;
  for (const file of walk(out)) {
    const rel = path.relative(out, file);
    const before = fs.readFileSync(file, 'utf8');
    const r = externalize(before, emit);
    if (r.moved) fs.writeFileSync(file, r.html);
    pages++;
    moved += r.moved;
    // 3. checks
    for (const m of r.html.matchAll(SCRIPT)) {
      if (isInlineExecutable(m[1])) problems.push(`${rel}: inline executable script left`);
    }
    if (!/<meta name="grcskills-build" content="[^"]+"/.test(r.html)) {
      problems.push(`${rel}: missing <meta name="grcskills-build">`);
    }
  }
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`postbuild: ${pages} pages, ${moved} inline scripts moved to /_inline/`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
