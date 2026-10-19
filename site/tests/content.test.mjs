// Rendering boundary: malicious Markdown and frontmatter render inert or fail
// the build (design doc "Site rendering boundary", acceptance I15).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, ContentError, isAllowedHref, CAPS, relatedSkills, decisionRules, DECISIONS_MAX } from '../scripts/content-lib.mjs';
import { CATEGORY_INTROS, FRAMEWORK_INTROS } from '../scripts/intros.mjs';
import { firstSentence } from '../lib/text.ts';
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
  const s = render('[law](https://eur-lex.europa.eu/eli/reg/2016/679/oj)\n\n[ref](references/rubric.md)\n\n[tpl](../../../templates/SKILL.template.md)', {
    refs: { rubric: '# Scoring rubric\n\nBody.' },
  });
  assert.match(s.html, /href="https:\/\/eur-lex\.europa\.eu\/eli\/reg\/2016\/679\/oj" rel="nofollow noopener noreferrer"/);
  assert.match(s.html, /href="\/skill\/fixture-skill\/rubric\/"/);
  assert.match(s.html, /href="https:\/\/github\.com\/better-isms\/grcskills\/blob\/main\/templates\/SKILL\.template\.md"/);
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

test('summary: required, at most 155 characters, never the agent trigger', () => {
  assert.equal(CAPS.summary, 155);
  assert.equal(loadContent(repoWith(skillMd({ summary: `A ${'x'.repeat(153)}` }))).skills[0].summary.length, 155);
  fails(repoWith(skillMd({ summary: `A ${'x'.repeat(154)}` })), /summary: 156 characters, cap is 155/);
  fails(repoWith(skillMd({ summary: 'Use this skill when a test needs a fixture skill for pages.' })), /summary: summary is for people/);
  fails(repoWith(skillMd().replace(/^summary: .*\n/m, '')), /summary: missing/);
});

test('related skills: same category first, then shared frameworks, never itself', () => {
  const mk = (slug, category, frameworks) => ({ slug, title: slug, category, frameworks });
  const all = [mk('a', 'risk', ['iso27001']), mk('b', 'risk', ['soc2']), mk('c', 'audit', ['iso27001']), mk('d', 'audit', ['gdpr']), mk('e', 'risk', ['iso27001', 'general'])];
  assert.deepEqual(relatedSkills(all[0], all), ['e', 'b', 'c']);
  assert.deepEqual(relatedSkills(all[3], all), ['c']);
  assert.deepEqual(relatedSkills(mk('z', 'privacy', ['hipaa']), all), []);
  assert.equal(relatedSkills(all[0], all, 1).length, 1);
});

test('intros: two or three sentences, first sentence fits a meta description, no em dash', () => {
  for (const [k, v] of Object.entries({ ...CATEGORY_INTROS, ...FRAMEWORK_INTROS })) {
    const n = v.split(/(?<=[.!?])\s+(?=[A-Z])/).length;
    assert.ok(n >= 2 && n <= 3, `${k}: ${n} sentences`);
    assert.ok(firstSentence(v).length <= 160, `${k}: first sentence is ${firstSentence(v).length} characters`);
    assert.ok(!v.includes('\u2014'), `${k}: em dash`);
  }
});

test('decisionRules keeps the rules that leave a call with a person, not data-handling rules', () => {
  const body = [
    '## Steps', '', '- NEVER accept a risk here; this is not the Rules section.', '',
    '## Rules', '',
    '- MUST cite a source for every row.',
    '- MUST present the scope as a proposal for leadership to approve.',
    '- NEVER accept a risk on the owner\'s behalf.',
    '- NEVER copy personal data into the register; use roles.',
    '- NEVER mark a control as effective; the reader\'s people decide that.',
    '  Wrapped continuation.',
    '', '## Framework lookups', '', '- NEVER approve anything in this later section.',
  ].join('\n');
  assert.deepEqual(decisionRules(body), [
    'Never accept a risk on the owner\'s behalf.',
    'Never mark a control as effective; the reader\'s people decide that. Wrapped continuation.',
    'Always present the scope as a proposal for leadership to approve.',
  ]);
  assert.deepEqual(decisionRules('## Steps\n\n- NEVER sign.\n'), []);
  // Review follow-up on PR #3: rules about the quality of evidence or data
  // handling mention approval or effectiveness but leave no call with a person.
  const quality = [
    '## Rules', '',
    '- NEVER ban a tool the company depends on without naming the approved alternative.',
    '- NEVER mark a tool approved on the strength of vendor marketing alone.',
    '- NEVER rate a row Evidenced on the strength of an interview or a policy alone.',
    '- NEVER create, backdate, re-sign or alter evidence to fill a gap; record the gap instead.',
    '- NEVER accept "the supplier handles it" as an exclusion without checking supplier oversight.',
    '- NEVER let the auditee choose the sample items.',
    '- NEVER exclude a control because it is not implemented yet.',
    '- NEVER classify a system\'s legal risk level in this skill; leave it for the classification step.',
    '- NEVER let an uncosted deferral pass as an acceptance.',
    '- NEVER delete or overwrite a superseded version.',
    '- NEVER send inventory content anywhere outside the reader\'s machine.',
    '- NEVER put personal data of individuals into the register; use roles.',
    '- MUST decide applicability per legal entity, citing the provision used.',
  ].join('\n');
  assert.deepEqual(decisionRules(quality), []);
  // Each kind of call the block is for: accepting, marking effective,
  // approving, signing, deciding, sending, changing systems, routing to a person.
  const kinds = (line) => decisionRules(`## Rules\n\n- ${line}\n`);
  for (const line of [
    'NEVER close or accept a risk on an owner\'s behalf.',
    'NEVER grade an exception as acceptable or effective; record the facts for the reader.',
    'NEVER record the statement as approved; the approver named by the reader signs it.',
    'NEVER fill in the decision, signature or date; those stay blank for the human signer.',
    'NEVER conclude that a transfer may proceed; the exporter\'s privacy lead and counsel decide.',
    'NEVER send briefs or invitations to staff; the reader distributes them.',
    'NEVER change repository settings, branch rules, approvals or deploy permissions.',
    'MUST route every prohibited or unclear result to the legal owner.',
    'MUST route monitoring and disciplinary wording to HR or legal for review.',
    'MUST route every flagged line to a reviewer who is not the account holder.',
    'MUST agree the scoring method with the reader before scoring any risk.',
    'MUST raise every contradicted control to its owner role as the first item in the gap list.',
    'NEVER put risks the owner wants to accept into the treatment plan; route them to an acceptance decision.',
  ]) assert.equal(kinds(line).length, 1, line);
  const many = ['## Rules', '', ...Array.from({ length: 9 }, (_, i) => `- NEVER approve item ${i}.`)].join('\n');
  assert.equal(decisionRules(many).length, DECISIONS_MAX);
});
