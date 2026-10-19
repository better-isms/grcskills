// Builds a throwaway library checkout (skills/<author>/...) in a temp folder.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const AUTHOR = `---
name: Test Author
title: Practitioner, Example Co
linkedinUrl: https://www.linkedin.com/in/test-author/
companyDomain: example.com
---

Test Author writes fixture skills for the site tests. The bio is long enough to be a bio and short enough to fit the cap.
`;

export const skillMd = ({ name = 'fixture-skill', title = 'Fixture skill', description, summary, category = 'risk', frameworks = '[iso27001, general]', extra = '', body = 'A fixture body.' } = {}) => `---
name: ${name}
title: ${title}
description: |
  ${description ?? 'Use this skill when a test needs a fixture skill. It produces nothing but a rendered page for the site tests to inspect.'}
category: ${category}
summary: "${summary ?? 'A fixture skill that the site tests render and inspect.'}"
frameworks: ${frameworks}
${extra}---

${body}
`;

// files: { 'skills/a/author.md': '...', ... }
export function makeRepo(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'grcskills-site-'));
  for (const [rel, text] of Object.entries(files)) {
    const p = path.join(root, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, text);
  }
  return root;
}

export const repoWith = (skill, { author = AUTHOR, slug = 'test-author', folder = 'fixture-skill', refs = {} } = {}) =>
  makeRepo({
    [`skills/${slug}/author.md`]: author,
    [`skills/${slug}/${folder}/SKILL.md`]: skill,
    ...Object.fromEntries(Object.entries(refs).map(([k, v]) => [`skills/${slug}/${folder}/references/${k}.md`, v])),
  });
