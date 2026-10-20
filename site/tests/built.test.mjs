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
  for (const p of ['index.html', 'skills/index.html', 'contribute/index.html', 'faq/index.html', '404.html', 'llms.txt', 'sitemap.xml', 'robots.txt', 'build.json', 'search-index.json', 'og.png', 'favicon.ico', 'favicon.svg']) {
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
  assert.equal(decode(html.match(/<h1 id="h1">([^<]*)<\/h1>/)?.[1] ?? ''), 'Open GRC skills for AI agents.', 'home H1 (founder decision 2026-10-19)');
  assert.ok(html.includes('Written the way experienced GRC people do the work. Your agent does the legwork. You make the calls.'), 'home subline');
  for (const item of ['A ranked shortlist for you to judge', 'for you to confirm', 'A 30-day plan draft. You decide what goes in it.']) assert.ok(html.includes(item), `What comes back: ${item}`);
  assert.ok(html.includes('Agent Skills for Claude Code, Codex, Cursor and any agent that reads SKILL.md.'));
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => [].concat(JSON.parse(m[1])));
  assert.ok(ld.some((n) => n['@type'] === 'WebSite' && n.url === 'https://grcskills.com/'));
  assert.ok(html.includes(decodeHtmlSafe(content.meta.prompt)), 'the prompt card shows prompts/setup-review.txt');
});
test('stance copy: no "practitioner methods" jargon; llms.txt says people decide; contribute frames publishing under your name', opts, () => {
  for (const rel of ['index.html', 'contribute/index.html', 'llms.txt']) assert.doesNotMatch(read(rel), /practitioner methods?/i, rel);
  assert.ok(read('llms.txt').includes('Skills support practitioners: they draft and prepare, people decide.'));
  assert.ok(read('contribute/index.html').includes('Publish your method, under your name'));
});

test('faq: FAQPage JSON-LD matches the visible questions and answers; links resolve; no em dashes', opts, () => {
  const html = read('faq/index.html');
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => [].concat(JSON.parse(m[1])));
  const faq = ld.find((n) => n['@type'] === 'FAQPage');
  assert.ok(faq, 'FAQPage node');
  assert.equal(faq.url, 'https://grcskills.com/faq/');
  const text = decode(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
  assert.ok(faq.mainEntity.length >= 20, `${faq.mainEntity.length} questions`);
  for (const q of faq.mainEntity) {
    assert.ok(text.includes(q.name), `visible question: ${q.name}`);
    for (const para of q.acceptedAnswer.text.split(/(?<=[.:])\s(?=[A-Z"])/)) assert.ok(text.includes(para.trim()), `visible answer part: ${para.slice(0, 60)}`);
  }
  assert.doesNotMatch(html, /\u2014/, 'no em dash');
  assert.ok(text.includes(content.meta.tag), 'install answer pins the current release');
  for (const m of html.matchAll(/href="(\/[^"#]*)"/g)) {
    const rel = m[1].replace(/^\//, '');
    if (rel.includes('.')) continue;
    assert.ok(fs.existsSync(path.join(out, rel, 'index.html')), `internal link ${m[1]}`);
  }
  assert.ok(read('sitemap.xml').includes('<loc>https://grcskills.com/faq/</loc>'), 'faq in sitemap');
  assert.ok(read('llms.txt').includes('https://grcskills.com/faq/'), 'faq in llms.txt');
});

test('ISMS Copilot placement: home band before the heyGRC band, nav link, attributed refs; heyGRC promotion unchanged', opts, () => {
  const home = read('index.html');
  const cop = home.indexOf('class="section copilot-band"');
  const hey = home.indexOf('class="section close heygrc-band"');
  assert.ok(cop > 0 && hey > cop, 'copilot band sits before the heyGRC band');
  assert.ok(home.includes('href="https://www.ismscopilot.com/mcp?ref=grcskills-home"'), 'home CTA ref');
  assert.ok(home.includes('https://account.ismscopilot.com/v1/account/mcp'), 'endpoint shown');
  for (const f of htmlFiles()) {
    const html = fs.readFileSync(f, 'utf8');
    if (!html.includes('<header class="nav">')) continue;
    assert.equal((html.match(/href="https:\/\/www\.ismscopilot\.com\/mcp\?ref=grcskills-nav"/g) ?? []).length, 2, `${f}: nav link, wide and small`);
    assert.equal((html.match(/class="topbar"/g) ?? []).length, 1, `${f}: heyGRC bar kept`);
  }
  assert.ok(home.includes('href="https://heygrc.com/for/grc-teams"'), 'heyGRC home band kept');
  for (const slug of ['secure-development-policy-from-pipeline', 'change-management-evidence-sampling', 'policy-gap-review-against-practice', 'grc-setup-review']) {
    assert.ok(read(`skill/${slug}/index.html`).includes('class="card heygrc'), `${slug}: heyGRC card kept`);
  }
  assert.ok(read('faq/index.html').includes('href="https://www.ismscopilot.com/mcp?ref=grcskills-faq-connect"'));
  assert.doesNotMatch(home, /\u2014/, 'no em dash on home');
});

test('skill pages: a "Where you decide" block from the skill\'s own rules, near the top', opts, () => {
  for (const s of content.skills) {
    const html = read(`skill/${s.slug}/index.html`);
    const block = html.match(/<section class="decide"[\s\S]*?<\/section>/)?.[0];
    assert.ok(block, `${s.slug}: decide block`);
    assert.ok(html.indexOf(block) < html.indexOf('class="skill-grid"'), `${s.slug}: block sits above the skill body`);
    assert.ok(block.includes('<p class="boundary">Everything it writes is a draft for a person to review and sign.</p>'), `${s.slug}: draft-only boundary, outside the rule list`);
    assert.equal((block.match(/<li>/g) ?? []).length, s.decisions.length, `${s.slug}: one item per rule, nothing that is not from the skill`);
    assert.equal(block.includes('From this skill&#x27;s rules: where you decide') || block.includes("From this skill's rules: where you decide"), s.decisions.length > 0, `${s.slug}: intro only above a list of the skill's rules`);
  }
  assert.ok(content.skills.filter((s) => s.decisions.length).length >= 50, 'most skills have at least one rule that keeps a call with a person');
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
  const ref = JSON.parse(fs.readFileSync(path.join(site, '..', '.claude-plugin', 'marketplace.json'), 'utf8')).plugins[0].source.ref;
  const run = llms.match(/## If you were asked to run grc-setup-review\n([\s\S]*?)\n## /)?.[1];
  assert.ok(run, 'llms.txt has the run-steps section');
  assert.ok(llms.indexOf('## If you were asked to run grc-setup-review') < llms.indexOf('## When to use'), 'run steps sit near the top');
  assert.ok(run.includes(`git clone --depth 1 --branch ${ref} https://github.com/better-isms/grcskills .grcskills`), `run steps clone the marketplace tag ${ref}`);
  assert.doesNotMatch(run, /npx/, 'run steps install nothing beyond the one pinned clone the request consents to; npx stays under ## Install');
  const install = llms.match(/## Install\n([\s\S]*?)\n## /)?.[1] ?? '';
  assert.ok(install.includes(`npx skills add better-isms/grcskills#${ref} --skill <skill-name>`), 'npx lives under ## Install, pinned');
  for (const p of ['.grcskills/AGENTS.md', '.grcskills/skills/tristan-roth/grc-setup-review/SKILL.md', './grc-setup-review/']) assert.ok(run.includes(p), p);
  assert.deepEqual([...new Set(run.match(/v\d{4}\.\d{2}\.\d{2}(?:\.\d+)?/g))], [ref], 'one tag, the pinned one');
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

// heyGRC cross-promotion (founder decisions X3 and X4, 2026-10-20).
const HEYGRC = 'https://heygrc.com/for/grc-teams';
const HEYGRC_SKILLS = ['secure-development-policy-from-pipeline', 'change-management-evidence-sampling', 'policy-gap-review-against-practice', 'grc-setup-review'];
const HEYGRC_LISTS = ['category/evidence/index.html', 'category/policies/index.html', 'framework/cra/index.html'];
const heygrcCard = (html) => /<section class="card heygrc[^"]*"/.test(html);

test('heyGRC: home band, card on exactly 4 skill pages and 3 list pages, footer keeps only the Copilot line', opts, () => {
  const home = read('index.html');
  const band = home.match(/<section class="section close heygrc-band"[\s\S]*?<\/section>/)?.[0];
  assert.ok(band, 'home band');
  assert.ok(band.includes(`href="${HEYGRC}"`), 'home band links to heyGRC');
  assert.ok(home.indexOf('id="back"') < home.indexOf('heygrc-band') && home.indexOf('heygrc-band') < home.indexOf('id="find"'), 'band sits after What comes back');
  for (const rel of pages()) {
    const ft = read(rel).match(/<footer class="ft">[\s\S]*?<\/footer>/)?.[0] ?? '';
    assert.ok(!/heygrc/i.test(ft), `${rel}: footer has no heyGRC line (the top bar replaces it)`);
    assert.ok(ft.includes('>by ISMS Copilot</a>'), `${rel}: Copilot footer link unchanged`);
  }
  for (const s of content.skills) {
    const html = read(`skill/${s.slug}/index.html`);
    assert.equal(heygrcCard(html), HEYGRC_SKILLS.includes(s.slug), `${s.slug}: heyGRC card only on the listed skills`);
    if (HEYGRC_SKILLS.includes(s.slug)) {
      const aside = html.match(/<aside class="aside"[\s\S]*?<\/aside>/)?.[0] ?? '';
      assert.ok(aside.indexOf('id="install"') < aside.indexOf('id="heygrc"'), `${s.slug}: card under the Install card`);
    }
  }
  for (const rel of pages().filter((r) => r.startsWith('category/') || r.startsWith('framework/'))) {
    assert.equal(heygrcCard(read(rel)), HEYGRC_LISTS.includes(rel), `${rel}: heyGRC card only on the listed pages`);
  }
});

test('heyGRC links carry no query string or fragment, and no image loads from heygrc.com', opts, () => {
  for (const f of htmlFiles()) {
    const html = fs.readFileSync(f, 'utf8');
    for (const m of html.matchAll(/(?:href|src)="(https?:\/\/[^"]*heygrc\.com[^"]*)"/g)) {
      assert.equal(decode(m[1]), HEYGRC, `${path.relative(out, f)}: ${m[1]}`);
    }
    assert.doesNotMatch(html, /src="https?:\/\/[^"]*heygrc\.com/, `${path.relative(out, f)}: image from heygrc.com`);
  }
});

// heyGRC announcement bar above the nav (founder pick 2026-10-20).
const TOPBAR_LONG = 'From the grcskills team: heyGRC checks each pull request against your frameworks.';
const TOPBAR_SHORT = 'heyGRC: evidence on each pull request.';

test('top bar: exactly one per page, first in body after the skip link, before the nav', opts, () => {
  for (const f of htmlFiles()) {
    const rel = path.relative(out, f);
    if (rel.startsWith('_')) continue;
    const html = fs.readFileSync(f, 'utf8');
    assert.equal(html.match(/<div class="topbar"/g)?.length, 1, `${rel}: one bar`);
    const body = html.slice(html.indexOf('<body'));
    // Next may put an empty hidden div first; nothing visible precedes the skip link.
    assert.match(body, /^<body[^>]*>(?:<div hidden="">(?:<!--[^>]*-->)*<\/div>)?<a class="skip" href="#main">Skip to content<\/a><div class="topbar"/, `${rel}: bar right after the skip link`);
    const bar = body.match(/<div class="topbar"[\s\S]*?<\/div>/)[0];
    assert.ok(body.indexOf(bar) < body.indexOf('<header class="nav"'), `${rel}: bar before the nav`);
    const links = [...bar.matchAll(/href="([^"]*)"/g)].map((m) => decode(m[1]));
    assert.deepEqual(links, [HEYGRC], `${rel}: one link, exactly ${HEYGRC}`);
    const text = decode(bar.replace(/<[^>]+>/g, ''));
    assert.ok(text.includes(TOPBAR_LONG) && text.includes(TOPBAR_SHORT) && text.includes('See how'), `${rel}: copy`);
    assert.match(bar, /<button type="button" class="tb-x" data-topbar-dismiss="" aria-label="Dismiss heyGRC announcement">/, `${rel}: close button`);
    assert.match(html.slice(0, html.indexOf('<body')), /<script src="\/topbar\.js"><\/script>/, `${rel}: topbar.js in head`);
  }
});

test('top bar: copy at most 90 characters with the link, no em dash; topbar.js shipped and keyed to TOPBAR.id', opts, () => {
  for (const c of [TOPBAR_LONG, TOPBAR_SHORT]) {
    assert.ok(`${c} See how`.length <= 90, `${c.length + 8} characters: ${c}`);
    assert.ok(!c.includes('\u2014'));
  }
  const js = read('topbar.js');
  const src = fs.readFileSync(path.join(site, 'lib', 'content.ts'), 'utf8');
  const id = src.match(/TOPBAR = \{\s*id: '([^']+)'/)?.[1];
  assert.ok(id, 'TOPBAR.id in lib/content.ts');
  assert.ok(js.includes(`var ID = '${id}';`), 'topbar.js stores TOPBAR.id');
  assert.ok(js.includes("var KEY = 'grcskills-topbar-dismissed';"));
  assert.equal(js.match(/localStorage\.setItem/g)?.length, 1, 'one write, the dismissal flag');
  assert.doesNotMatch(js, /fetch|XMLHttpRequest|sendBeacon|document\.cookie/, 'no network, no cookies');
  assert.ok(src.includes(`long: '${TOPBAR_LONG}'`) && src.includes(`short: '${TOPBAR_SHORT}'`), 'test copy matches lib/content.ts');
});
