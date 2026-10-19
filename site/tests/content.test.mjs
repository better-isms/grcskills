// Rendering boundary: malicious Markdown and frontmatter render inert or fail
// the build (design doc "Site rendering boundary", acceptance I15).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, ContentError, isAllowedHref, CAPS } from '../scripts/content-lib.mjs';
import { repoWith, skillMd, AUTHOR } from './fixtures.mjs';

const render = (body, opts = {}) => loadContent(repoWith(skillMd({ body }), opts)).skills[0];
const hrefs = (html) => [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);

test('a clean fixture loads', () => {
  const s = render('## Step 1\n\nDo the thing.');
  assert.equal(s.slug, 'fixture-skill');
  assert.match(s.html, /<h2 id="step-1">Step 1<\/h2>/);
});

test('raw HTML in the body is escaped, never emitted as markup', () => {
  const s = render('Hello <script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n<iframe src="https://evil.example"></iframe>\n\n<a href="javascript:alert(1)">x</a>');
  assert.doesNotMatch(s.html, /<script/i);
  assert.doesNotMatch(s.html, /<img/i);
  assert.doesNotMatch(s.html, /<iframe/i);
  assert.doesNotMatch(s.html, /<a href="javascript/i);
  assert.match(s.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test('javascript:, data:, vbscript:, http: and protocol-relative links lose their href', () => {
  const s = render([
    '[a](javascript:alert(1))',
    '[b](JaVaScRiPt:alert(1))',
    '[c](data:text/html;base64,PHNjcmlwdD4=)',
    '[d](vbscript:msgbox)',
    '[e](http://evil.example/)',
    '[f](//evil.example/x)',
    '<javascript:alert(1)>',
    '[g](java\tscript:alert(1))',
    '[h](&#106;avascript:alert(1))',
    '[i](mailto:someone@example.com)',
  ].join('\n\n'));
  for (const h of hrefs(s.html)) {
    assert.ok(h.startsWith('https://') || h.startsWith('/') || h.startsWith('#'), `unexpected href ${h}`);
    assert.doesNotMatch(h, /script:|^data:|^http:|^\/\//i);
  }
});

test('https links survive with rel=nofollow; relative links resolve to site or GitHub', () => {
  const s = render('[law](https://eur-lex.europa.eu/eli/reg/2016/679/oj)\n\n[ref](references/rubric.md)\n\n[tpl](../../../templates/SKILL.md)', {
    refs: { rubric: '# Scoring rubric\n\nBody.' },
  });
  assert.match(s.html, /href="https:\/\/eur-lex\.europa\.eu\/eli\/reg\/2016\/679\/oj" rel="nofollow noopener noreferrer"/);
  assert.match(s.html, /href="\/skill\/fixture-skill\/rubric\/"/);
  assert.match(s.html, /href="https:\/\/github\.com\/better-isms\/grcskills\/blob\/main\/templates\/SKILL\.md"/);
  assert.equal(s.references[0].title, 'Scoring rubric');
  assert.doesNotMatch(s.references[0].html, /<h1/);
});

test('a relative link that escapes the repository is dropped', () => {
  const s = render('[x](../../../../../etc/passwd)');
  assert.deepEqual(hrefs(s.html), []);
});

test('image syntax never renders an <img>', () => {
  const s = render('![tracker](https://evil.example/pixel.png)');
  assert.doesNotMatch(s.html, /<img/i);
});

test('isAllowedHref allowlist', () => {
  for (const ok of ['https://x.example', 'references/a.md', './a.md', '#top', '/skill/x/']) assert.ok(isAllowedHref(ok), ok);
  for (const bad of ['javascript:x', 'data:x', 'http://x', '//x', 'file:///etc', 'mailto:a@b.c', ' ', 'vbscript:x', '\\\\evil']) assert.ok(!isAllowedHref(bad), bad);
});

test('</script> in a frontmatter title loads as plain text (escaped at render and in JSON-LD)', () => {
  const s = loadContent(repoWith(skillMd({ title: 'Evil </script><script>alert(1)</script>' }))).skills[0];
  assert.equal(s.title, 'Evil </script><script>alert(1)</script>');
});

const fails = (repo, pattern) => {
  assert.throws(() => loadContent(repo), (e) => e instanceof ContentError && e.problems.some((p) => pattern.test(p)));
};

test('overlong title fails the build', () => {
  fails(repoWith(skillMd({ title: 'x'.repeat(CAPS.title + 1) })), /title: \d+ characters, cap is 80/);
});

test('overlong description fails the build', () => {
  fails(repoWith(skillMd({ description: `Use this skill when ${'x'.repeat(CAPS.description)}` })), /description: \d+ characters/);
});

test('overlong bio fails the build', () => {
  fails(repoWith(skillMd(), { author: AUTHOR.replace(/\n\nTest Author writes[^\n]*\n/, `\n\n${'word '.repeat(130)}\n`) }), /bio: \d+ characters, cap is 600/);
});

test('an email field in author.md fails the build', () => {
  fails(repoWith(skillMd(), { author: AUTHOR.replace('companyDomain:', 'email: a@example.com\ncompanyDomain:') }), /unknown key `email`/);
});

test('a javascript: LinkedIn URL fails the build', () => {
  fails(repoWith(skillMd(), { author: AUTHOR.replace('https://www.linkedin.com/in/test-author/', 'javascript:alert(1)') }), /linkedinUrl/);
});

test('unknown category, unknown framework and a name/folder mismatch fail the build', () => {
  fails(repoWith(skillMd({ category: 'made-up' })), /category/);
  fails(repoWith(skillMd({ frameworks: '[iso9001]' })), /unknown tag "iso9001"/);
  fails(repoWith(skillMd({ name: 'other-name' })), /must equal the folder name/);
});

test('a bidi override in the title fails the build', () => {
  fails(repoWith(skillMd({ title: 'Safe \u202eeman' })), /control or bidi/);
});

test('an author slug that shadows a site route fails the build', () => {
  fails(repoWith(skillMd(), { slug: 'skills' }), /reserved/);
});
