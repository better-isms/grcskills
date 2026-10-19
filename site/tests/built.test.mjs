// Checks on the built static export in out/. Run after `npm run build`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(site, 'out');
const built = fs.existsSync(path.join(out, 'index.html'));
const opts = { skip: built ? false : 'out/ not built; run npm run build first' };
const content = built ? JSON.parse(fs.readFileSync(path.join(site, '.generated', 'content.json'), 'utf8')) : null;
const read = (rel) => fs.readFileSync(path.join(out, rel), 'utf8');

function files(dir, filter) {
  const acc = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) acc.push(...files(p, filter));
    else if (filter(p)) acc.push(p);
  }
  return acc;
}
const htmlFiles = () => files(out, (p) => p.endsWith('.html'));
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

test('every skill, reference, author, category and framework page exists', opts, () => {
  for (const s of content.skills) {
    assert.ok(fs.existsSync(path.join(out, 'skill', s.slug, 'index.html')), `skill ${s.slug}`);
    for (const r of s.references) assert.ok(fs.existsSync(path.join(out, 'skill', s.slug, r.slug, 'index.html')), `ref ${s.slug}/${r.slug}`);
  }
  for (const a of content.authors.filter((x) => x.skills.length)) assert.ok(fs.existsSync(path.join(out, a.slug, 'index.html')), `author ${a.slug}`);
  for (const c of content.categories.filter((x) => x.count)) assert.ok(fs.existsSync(path.join(out, 'category', c.slug, 'index.html')), `category ${c.slug}`);
  for (const f of content.frameworks.filter((x) => x.count)) assert.ok(fs.existsSync(path.join(out, 'framework', f.tag, 'index.html')), `framework ${f.tag}`);
  for (const p of ['index.html', 'skills/index.html', 'contribute/index.html', '404.html', 'llms.txt', 'sitemap.xml', 'robots.txt', 'build.json', 'search-index.json', 'og.png']) {
    assert.ok(fs.existsSync(path.join(out, p)), p);
  }
  assert.equal(files(out, (p) => p.includes(`${path.sep}_none${path.sep}`)).length, 0, 'placeholder pages removed');
});

test('skill pages: title pattern, meta description, Copilot ref, install picker, GitHub link', opts, () => {
  for (const s of content.skills) {
    const html = read(`skill/${s.slug}/index.html`);
    assert.match(html, new RegExp(`<title>${s.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\| grcskills</title>`));
    const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    assert.equal(decode(desc ?? ''), s.description);
    assert.ok(html.includes(`href="https://www.ismscopilot.com/mcp?ref=grcskills-${s.slug}"`), `copilot link ${s.slug}`);
    const text = html.replace(/<[^>]+>/g, '');
    assert.ok(text.includes(`npx skills add better-isms/grcskills --skill ${s.slug}`), 'npx tab');
    assert.ok(text.includes('/plugin marketplace add better-isms/grcskills'), 'plugin tab');
    assert.ok(text.includes(`git clone --branch ${content.meta.tag} https://github.com/better-isms/grcskills`), 'clone tab');
    assert.ok(html.includes(`https://github.com/better-isms/grcskills/blob/${content.meta.tag}/${s.repoPath}`));
  }
});

test('every ISMS Copilot link carries ref=grcskills-<slug>', opts, () => {
  for (const f of htmlFiles()) {
    for (const m of read(path.relative(out, f)).matchAll(/href="(https?:\/\/[^"]*ismscopilot\.com[^"]*)"/g)) {
      const u = new URL(decode(m[1]));
      assert.match(u.searchParams.get('ref') ?? '', /^grcskills-[a-z0-9][a-z0-9-]{0,53}$/, `${path.relative(out, f)}: ${m[1]}`);
    }
  }
});

test('zero em dashes in built pages and text files', opts, () => {
  const textFiles = files(out, (p) => /\.(html|txt|xml|json|js)$/.test(p) && !p.includes(`${path.sep}_next${path.sep}`));
  for (const f of textFiles) assert.ok(!fs.readFileSync(f, 'utf8').includes('\u2014'), `em dash in ${path.relative(out, f)}`);
});

test('no inline executable script remains; JSON-LD blocks parse and are escaped', opts, () => {
  for (const f of htmlFiles()) {
    const html = fs.readFileSync(f, 'utf8');
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const attrs = m[1];
      if (/\bsrc=/.test(attrs)) continue;
      assert.match(attrs, /type="application\/ld\+json"/, `${path.relative(out, f)}: inline script`);
      assert.doesNotMatch(m[2], /[<>]/);
      JSON.parse(m[2]);
    }
  }
});

test('every page embeds the build SHA, and build.json matches it', opts, () => {
  const b = JSON.parse(read('build.json'));
  assert.match(b.sha, /^[0-9a-f]{7,40}$|^unknown$/);
  for (const f of htmlFiles()) {
    const html = fs.readFileSync(f, 'utf8');
    assert.ok(html.includes(`<meta name="grcskills-build" content="${b.sha}"/>`), `${path.relative(out, f)}: build meta`);
  }
});

test('llms.txt and sitemap list every skill', opts, () => {
  const llms = read('llms.txt');
  const sitemap = read('sitemap.xml');
  for (const s of content.skills) {
    assert.ok(llms.includes(`https://grcskills.com/skill/${s.slug}/`));
    assert.ok(sitemap.includes(`<loc>https://grcskills.com/skill/${s.slug}/</loc>`));
  }
  assert.ok(llms.includes(content.meta.prompt));
});

test('author pages carry no email address', opts, () => {
  for (const a of content.authors.filter((x) => x.skills.length)) {
    const html = read(`${a.slug}/index.html`);
    assert.doesNotMatch(html, /mailto:|[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/);
  }
});

test('vercel.json CSP: strict script-src, no unsafe-inline or unsafe-eval for scripts', () => {
  const v = JSON.parse(fs.readFileSync(path.join(site, 'vercel.json'), 'utf8'));
  const all = v.headers.find((h) => h.source === '/(.*)').headers;
  const csp = all.find((h) => h.key === 'Content-Security-Policy').value;
  const script = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith('script-src'));
  assert.equal(script, "script-src 'self'");
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /connect-src 'self'/);
  assert.equal(all.find((h) => h.key === 'X-Content-Type-Options').value, 'nosniff');
  assert.equal(all.find((h) => h.key === 'Referrer-Policy').value, 'strict-origin-when-cross-origin');
});
