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
  for (const p of ['index.html', 'skills/index.html', 'contribute/index.html', '404.html', 'llms.txt', 'sitemap.xml', 'robots.txt', 'build.json', 'search-index.json', 'og.png', 'favicon.ico', 'favicon.svg']) {
    assert.ok(fs.existsSync(path.join(out, p)), p);
  }
  assert.equal(files(out, (p) => p.includes(`${path.sep}_none${path.sep}`)).length, 0, 'placeholder pages removed');
});

test('skill pages: title pattern, summary as meta description, Copilot ref, pinned install picker, GitHub link', opts, () => {
  for (const s of content.skills) {
    const html = read(`skill/${s.slug}/index.html`);
    assert.match(html, new RegExp(`<title>${s.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}: GRC agent skill \\| grcskills</title>`));
    assert.equal(decode(meta(html, 'name', 'description') ?? ''), s.summary);
    assert.ok(s.summary.length <= 155, `${s.slug}: summary is ${s.summary.length} characters`);
    assert.equal(decode(meta(html, 'property', 'og:description') ?? ''), s.summary);
    assert.ok(html.includes(`href="https://www.ismscopilot.com/mcp?ref=grcskills-${s.slug}"`), `copilot link ${s.slug}`);
    const text = html.replace(/<[^>]+>/g, '');
    assert.ok(text.includes(`npx skills add better-isms/grcskills#${content.meta.tag} --skill ${s.slug}`), 'npx tab pins the release');
    assert.ok(text.includes('/plugin marketplace add better-isms/grcskills'), 'plugin tab');
    assert.ok(text.includes(`git clone --branch ${content.meta.tag} https://github.com/better-isms/grcskills`), 'clone tab');
    assert.ok(html.includes(`https://github.com/better-isms/grcskills/blob/${content.meta.tag}/${s.repoPath}`));
  }
});

// <meta {attr}="{key}" content="..."> in Next's output order.
function meta(html, attr, key) {
  return html.match(new RegExp(`<meta ${attr}="${key.replace(/[.:]/g, '\\$&')}" content="([^"]*)"`))?.[1];
}
const pages = () => htmlFiles().map((f) => path.relative(out, f)).filter((r) => !r.startsWith('_') && r !== '404.html' && !r.startsWith('404'));

test('every page has og:image, og:site_name, og:url, twitter:image and a canonical; images exist', opts, () => {
  for (const rel of pages()) {
    const html = read(rel);
    const img = meta(html, 'property', 'og:image');
    assert.ok(img, `${rel}: og:image`);
    assert.ok(img.startsWith('https://grcskills.com/'), `${rel}: og:image is absolute`);
    assert.ok(fs.existsSync(path.join(out, new URL(img).pathname)), `${rel}: ${img} exists`);
    assert.equal(meta(html, 'name', 'twitter:image'), img, `${rel}: twitter:image`);
    assert.equal(meta(html, 'name', 'twitter:card'), 'summary_large_image');
    assert.equal(meta(html, 'property', 'og:site_name'), 'grcskills', `${rel}: og:site_name`);
    const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
    assert.ok(canonical, `${rel}: canonical`);
    assert.equal(meta(html, 'property', 'og:url'), canonical, `${rel}: og:url equals the canonical`);
    const desc = decode(meta(html, 'name', 'description') ?? '');
    assert.ok(desc.length >= 50 && desc.length <= 160, `${rel}: description is ${desc.length} characters`);
  }
});

test('skill OG cards are 1200x630 PNGs', opts, () => {
  for (const s of content.skills) {
    const png = fs.readFileSync(path.join(out, 'og', 'skill', `${s.slug}.png`));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
  }
});

test('titles: home, skill, category, framework and 404 templates', opts, () => {
  const title = (rel) => decode(read(rel).match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  assert.equal(title('index.html'), 'grcskills: open GRC skills for AI agents');
  for (const c of content.categories.filter((x) => x.count)) assert.equal(title(`category/${c.slug}/index.html`), `${c.label} skills for AI agents | grcskills`);
  for (const f of content.frameworks.filter((x) => x.count)) assert.equal(title(`framework/${f.tag}/index.html`), `${f.label} agent skills | grcskills`);
  assert.equal(title('404.html'), 'Page not found | grcskills');
});

test('home: canonical, og:url, the works-with line and a WebSite node', opts, () => {
  const html = read('index.html');
  assert.ok(html.includes('<link rel="canonical" href="https://grcskills.com/"/>'));
  assert.equal(meta(html, 'property', 'og:url'), 'https://grcskills.com/');
  assert.ok(html.includes('One prompt. Your setup, reviewed.'), 'H1 unchanged');
  assert.ok(html.includes('Agent Skills for Claude Code, Codex, Cursor and any agent that reads SKILL.md.'));
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => [].concat(JSON.parse(m[1])));
  assert.ok(ld.some((n) => n['@type'] === 'WebSite' && n.url === 'https://grcskills.com/'));
  assert.ok(html.includes(decodeHtmlSafe(content.meta.prompt)), 'the prompt card shows prompts/setup-review.txt');
});
const decodeHtmlSafe = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

test('skill pages: JSON-LD with summary, dates, image and the GitHub folder; four related skills', opts, () => {
  for (const s of content.skills) {
    const html = read(`skill/${s.slug}/index.html`);
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const node = ld.find((n) => n['@type'] === 'SoftwareSourceCode');
    assert.ok(node, `${s.slug}: SoftwareSourceCode node`);
    assert.equal(node.description, s.summary);
    assert.equal(node.codeRepository, `https://github.com/better-isms/grcskills/tree/${content.meta.tag}/${path.posix.dirname(s.repoPath)}`);
    assert.equal(node.image, `https://grcskills.com/og/skill/${s.slug}.png`);
    if (s.dateModified) assert.equal(node.dateModified, s.dateModified);
    assert.equal(s.related.length, 4, `${s.slug}: four related skills`);
    const block = html.split('id="related"')[1] ?? '';
    for (const r of s.related) assert.ok(block.includes(`href="/skill/${r}/"`), `${s.slug}: related ${r}`);
  }
});

test('category and framework pages carry their intro; thin framework pages are noindex and out of the sitemap', opts, () => {
  const sitemap = read('sitemap.xml');
  for (const c of content.categories.filter((x) => x.count)) {
    assert.ok(c.intro.length > 80, `${c.slug}: intro`);
    assert.ok(read(`category/${c.slug}/index.html`).includes(decodeHtmlSafe(c.intro).replace(/'/g, '&#x27;')), `${c.slug}: intro on page`);
  }
  for (const f of content.frameworks.filter((x) => x.count)) {
    const html = read(`framework/${f.tag}/index.html`);
    const noindex = /<meta name="robots" content="noindex/.test(html);
    assert.equal(noindex, f.count < 3, `${f.tag}: noindex only below 3 skills`);
    assert.equal(sitemap.includes(`/framework/${f.tag}/</loc>`), f.count >= 3, `${f.tag}: sitemap`);
  }
});

test('sitemap entries carry a lastmod when git history is available', opts, () => {
  if (!content.meta.dateModified) return;
  for (const m of read('sitemap.xml').matchAll(/<url>(.*?)<\/url>/g)) assert.match(m[1], /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
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

test('llms.txt and sitemap list every skill; llms.txt carries no descriptions', opts, () => {
  const llms = read('llms.txt');
  const sitemap = read('sitemap.xml');
  for (const s of content.skills) {
    assert.ok(llms.includes(`https://grcskills.com/skill/${s.slug}/`));
    assert.ok(!llms.includes(s.description), `llms.txt must not carry contributor prose (${s.slug})`);
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
