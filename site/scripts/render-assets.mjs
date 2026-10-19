#!/usr/bin/env node
// Renders the committed brand assets from scripts/og-lib.mjs (run by hand
// after a change to the prompt or the design, then commit the outputs):
//   assets/banner-light.svg, assets/banner-dark.svg   README banner (text as paths)
//   assets/social-preview.png                         GitHub social preview, 1280x640
//   site/public/favicon.ico                           16 and 32 px
//
// Usage (from site/): node scripts/render-assets.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { heroCard, glyph, ico, toSvg, toPng } from './og-lib.mjs';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(siteDir, '..');
const prompt = fs.readFileSync(path.join(repoRoot, 'prompts', 'setup-review.txt'), 'utf8').trim();
const out = (rel, data) => {
  const file = path.join(repoRoot, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  console.log(`${rel} ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
};

for (const theme of ['light', 'dark']) {
  const svg = await toSvg(heroCard({ prompt, theme, width: 1280, height: 580, h1Size: 76, promptChars: 160 }), 1280, 580);
  out(`assets/banner-${theme}.svg`, svg);
}
out('assets/social-preview.png', toPng(await toSvg(heroCard({ prompt, width: 1280, height: 640, h1Size: 96 }), 1280, 640), 1280));

const sizes = [16, 32];
const pngs = [];
for (const size of sizes) pngs.push({ size, data: toPng(await toSvg(glyph(64), 64, 64), size) });
out('site/public/favicon.ico', ico(pngs));
