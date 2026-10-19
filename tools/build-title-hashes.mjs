#!/usr/bin/env node
// Maintainer-only: builds tools/data/title-hashes.json from a plaintext list of
// official control titles kept OFF the repo (one title per line). Only sha256
// digests are written; the titles never enter the repository.
//
//   node tools/build-title-hashes.mjs <titles.txt> [--min-words 4] [--source "<label>"]
//
// Titles shorter than --min-words are skipped: one to three word titles are
// mostly terms of art ("segregation of duties", "business impact analysis")
// that skills must be free to use. TERMS_OF_ART below are the generic names of
// management systems, which some standards also use as a clause title; they are
// excluded so a skill can name the system it works on. See tools/data/README.md.

import fs from 'node:fs';
import { hashTitle, normalizeTitle, TITLE_HASH_FILE, TITLE_WINDOW } from './validate.mjs';

const TERMS_OF_ART = new Set([
  'information security management system',
  'privacy information management system',
  'business continuity management system',
  'artificial intelligence management system',
].map(normalizeTitle));

const argv = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = argv.indexOf(name);
  return i === -1 ? dflt : argv[i + 1];
};
const input = argv.find((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));
if (!input) {
  console.error('usage: node tools/build-title-hashes.mjs <titles.txt> [--min-words 4] [--source "<label>"]');
  process.exit(1);
}
const minWords = Number(flag('--min-words', '4'));
const source = flag('--source', 'licensed internal framework data (titles held off-repo)');

const hashes = new Set();
let skipped = 0;
for (const line of fs.readFileSync(input, 'utf8').split('\n')) {
  const words = normalizeTitle(line).split(' ').filter(Boolean);
  if (words.length < Math.max(minWords, TITLE_WINDOW.min) || TERMS_OF_ART.has(words.join(' '))) { if (words.length) skipped++; continue; }
  hashes.add(hashTitle(line));
}

const out = {
  version: 1,
  algorithm: 'sha256',
  normalization: 'NFKD, diacritics removed, lowercase, runs of characters outside [a-z0-9] become one space, trimmed; titles longer than maxWindow words are hashed on their first maxWindow words',
  minWindow: TITLE_WINDOW.min,
  maxWindow: TITLE_WINDOW.max,
  minTitleWords: minWords,
  source,
  hashes: [...hashes].sort(),
};
fs.writeFileSync(TITLE_HASH_FILE, `${JSON.stringify(out, null, 2)}\n`);
console.log(`wrote ${hashes.size} hashes to ${TITLE_HASH_FILE} (${skipped} titles under ${minWords} words or terms of art skipped)`);
