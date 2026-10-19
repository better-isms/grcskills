#!/usr/bin/env node
// Replays the recorded demo run for the README GIF (assets/demo/demo.gif).
// Everything printed comes from files in this folder: the steps from
// transcript.md (tool calls that ran, in order) and the results from output/.
// Render: vhs assets/demo/demo.tape (from the repo root).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(here, f), 'utf8');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const W = 106;
const c = { dim: '\x1b[2m', b: '\x1b[1m', g: '\x1b[32m', cy: '\x1b[36m', y: '\x1b[33m', r: '\x1b[0m' };
const out = (s = '') => process.stdout.write(`${s}\n`);
const cut = (s, n = W - 4) => (s.length > n ? `${s.slice(0, n - 3)}...` : s);

// Steps that ran (a "(not run: ...)" line under a step means it was declined).
const transcript = read('transcript.md');
const prompt = transcript.match(/## Prompt\n\n```\n([\s\S]*?)\n```/)[1];
const blocks = transcript.split(/\n(?=\d+\. )/).filter((b) => /^\d+\. /.test(b));
const ran = blocks
  .filter((b) => !b.includes('(not run:'))
  .map((b) => b.match(/^\d+\. (\w+): `([^\n]*)`/))
  .filter(Boolean)
  .map(([, tool, arg]) => ({ tool, arg }))
  .filter((s) => ['Bash', 'Read', 'Grep', 'Write'].includes(s.tool) && !s.arg.startsWith('<'));

const lines = [];
const company = [];
for (const s of ran) {
  if (s.tool === 'Read' && !s.arg.startsWith('.vendor/')) { company.push(s.arg); continue; }
  if (company.length) {
    const dirs = {};
    for (const f of company) { const d = f.includes('/') ? `${f.split('/')[0]}/` : f; (dirs[d] ??= []).push(f); }
    lines.push(['Read', Object.entries(dirs).map(([d, fs]) => (fs.length > 1 ? `${d} (${fs.length} files)` : fs[0])).join(', ')]);
    company.length = 0;
  }
  if (s.tool === 'Grep') {
    const pattern = s.arg.match(/"pattern":"([^"]*)"/)?.[1] ?? '';
    const where = s.arg.match(/"path":"([^"]*)"/)?.[1] ?? '';
    lines.push(['Grep', `${pattern}  in ${where}`]);
  } else if (s.tool === 'Bash' && /^ls -R|cat-file/.test(s.arg)) {
    lines.push(['Bash', 'check the tag and count the skills (60)']);
  } else if (s.tool === 'Bash' && s.arg.startsWith('cat registers')) {
    lines.push(['Bash', 'cat registers/*.csv incidents/incident-log.csv']);
  } else {
    lines.push([s.tool, s.arg]);
  }
}

const top = read('output/top-10.md')
  .split('\n')
  .filter((l) => /^\| \d+ \|/.test(l))
  .map((l) => l.split('|').map((x) => x.trim()))
  .map((p) => ({ rank: p[1], skill: p[2].replace(/`/g, ''), effort: p[4], why: p[5] }));
const weeks = read('output/30-day-plan.md').split('\n').filter((l) => l.startsWith('## Week')).map((l) => l.slice(3));

out(`${c.dim}# Replay of a recorded headless Claude Code run (4 min, sped up).${c.r}`);
out(`${c.dim}# Sample company is fictional. Transcript and outputs: assets/demo/${c.r}`);
out();
process.stdout.write(`${c.b}$ claude -p "${c.r}`);
const words = prompt.split(' ');
let col = 14;
for (const [i, w] of words.entries()) {
  if (col + w.length + 1 > W) { process.stdout.write('\n  '); col = 2; }
  else if (i > 0) { process.stdout.write(' '); col += 1; }
  process.stdout.write(w);
  col += w.length;
  await sleep(28);
}
out(`${c.b}"${c.r}`);
await sleep(700);
out();
for (const [tool, arg] of lines) {
  out(`${c.cy}*${c.r} ${c.b}${tool}${c.r} ${cut(arg, W - tool.length - 3)}`);
  await sleep(tool === 'Write' ? 420 : 520);
}
out(`${c.g}done${c.r} 4 drafts written to grc-setup-review/ for a human to review`);
await sleep(1200);
out();
out(`${c.b}top-10.md${c.r}  ${c.dim}rank, skill, effort${c.r}`);
for (const t of top) {
  out(`  ${t.rank.padStart(2)}  ${t.skill.padEnd(36)} ${c.y}${t.effort}${c.r}`);
  await sleep(220);
}
await sleep(900);
out();
out(`${c.b}30-day-plan.md${c.r}`);
for (const w of weeks) {
  out(`  ${w}`);
  await sleep(300);
}
await sleep(4000);
