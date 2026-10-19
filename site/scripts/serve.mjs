#!/usr/bin/env node
// Local static server for out/, applying the headers from vercel.json so the
// CSP is exercised exactly as in production. Not used in production.
//   node scripts/serve.mjs [dir=out] [port=4321]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', process.argv[2] ?? 'out');
const port = Number(process.argv[3] ?? 4321);
const vercel = JSON.parse(fs.readFileSync(path.join(here, '..', 'vercel.json'), 'utf8'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

const headersFor = (url) => {
  const out = {};
  for (const rule of vercel.headers) {
    const re = new RegExp(`^${rule.source.replace(/\(\.\*\)/g, '.*')}$`);
    if (re.test(url)) for (const h of rule.headers) out[h.key] = h.value;
  }
  delete out['Strict-Transport-Security'];
  out['Content-Security-Policy'] = out['Content-Security-Policy']?.replace('; upgrade-insecure-requests', '');
  return out;
};

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(root, url);
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!url.endsWith('/')) { res.writeHead(308, { Location: `${url}/` }).end(); return; }
    file = path.join(file, 'index.html');
  }
  let status = 200;
  if (!fs.existsSync(file)) { status = 404; file = path.join(root, '404.html'); }
  const type = TYPES[path.extname(file)] ?? 'application/octet-stream';
  res.writeHead(status, { 'Content-Type': type, ...headersFor(url) });
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${port}`));
