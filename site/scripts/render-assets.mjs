#!/usr/bin/env node
// Renders the committed brand assets from scripts/og-lib.mjs (run by hand
// after a change to the prompt or the design, then commit the outputs):
//   assets/banner-light.svg, assets/banner-dark.svg   README banner (text as paths)
//   assets/social-preview.png                         GitHub social preview, 1280x640
//   site/public/favicon.ico                           16 and 32 px
//
// The committed images show a tag-free excerpt of the one prompt, so a new
// release never leaves a stale tag in them. The full, pinned prompt lives in
// prompts/setup-review.txt (README, site, and the site's build-time og.png).
//
// Usage (from site/): node scripts/render-assets.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { heroCard, glyph, ico, toSvg, toPng } from './og-lib.mjs';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(siteDir, '..');
const prompt = 'Read grcskills.com/llms.txt, then run grc-setup-review on my GRC setup\u2026';
if (/v\d{4}\.\d{2}\.\d{2}/.test(prompt)) throw new Error('the committed banner prompt must not pin a release tag');
const out = (rel, data) => {
  const file = path.join(repoRoot, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  console.log(`${rel} ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
};

for (const theme of ['light', 'dark']) {
  const svg = await toSvg(heroCard({ prompt, theme, width: 1280, height: 580, h1Size: 76, promptChars: prompt.length }), 1280, 580);
  out(`assets/banner-${theme}.svg`, svg);
}
out('assets/social-preview.png', toPng(await toSvg(heroCard({ prompt, width: 1280, height: 640, h1Size: 86, promptChars: prompt.length }), 1280, 640), 1280));

const sizes = [16, 32];
const pngs = [];
for (const size of sizes) pngs.push({ size, data: toPng(await toSvg(glyph(64), 64, 64), size) });
out('site/public/favicon.ico', ico(pngs));
