// seo-gate v1.0.1 canonical: tristanroth1/founder-ops lib/seo-gate/seo-gate.mjs
/*
  Shared SEO launch gate (docs/seo-standard-design.md D-V, R1).

  Modes:
    node seo-gate.mjs build <dir> --config <json> [--level L0|L0P]
    node seo-gate.mjs live <origin> --config <json> [--level L0|L0P]
        [--transport <preview origin> --deployment-receipt <file>] [--sample every:N|first:N]
    node seo-gate.mjs snapshot <origin> --config <json> [--transport ... --deployment-receipt ...] [--out <file>]
    node seo-gate.mjs digest <file> [--version-file <VERSION>]

  Output: one line per finding, `<check id> <path> <detail>`, where detail is
  typed (counts, lengths, hashes, enums), never page text. Then a coverage
  line and one status line: pass | pass-with-exceptions | pass-sampled | fail
  | incomplete | config-error.

  Exit codes: 0 pass, 1 L0 failure, 2 config or input error, 3 incomplete or
  not measured (classified waf or origin).

  Single file, zero dependencies, Node 20+. Vendored by each site as
  scripts/seo-gate.mjs; the digest of everything below line 1 is pinned in
  founder-ops lib/seo-gate/VERSION (spec A6, I16).
*/
import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { promises as dnsp } from "node:dns";
import net from "node:net";
import http from "node:http";
import https from "node:https";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

export const VERSION = "1.0.0";

// ---------------------------------------------------------------- constants

export const CHECK_IDS = Object.freeze([
  "L0-01", "L0-02", "L0-03", "L0-06", "L0-07", "L0-08", "L0-09", "L0-10", "L0-11", "L0-12",
  "L0P-01", "L0P-02", "L0P-03", "L0P-04", "L0-host-not-allowlisted", "L0-exceptions",
]);
const LEVELS = ["L0", "L0P", "L0Q"];
const atLeast = (level, min) => LEVELS.indexOf(level) >= LEVELS.indexOf(min);
const L0P_DEFAULTS = { "L0P-01": "block", "L0P-02": "block", "L0P-03": "warn", "L0P-04": "block" };
const AI_SEARCH = ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"];
const AI_TRAINING = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot"];
const SOCIAL_TYPES = new Set(["home", "catalog-item", "guide", "product"]);
const DEFAULT_SKIP = ["/404", "/500", "/_not-found", "/_global-error", "/_error"];
const BEHAVIOURS = ["canonical-to", "dynamic-live-only", "noindex"];
export const LIMITS = Object.freeze({
  maxBytes: 3 * 1024 * 1024, timeoutMs: 10_000, maxHops: 5, concurrency: 4, htmlMax: 2 * 1024 * 1024,
  maxExceptions: 20, exceptionShare: 0.05, exceptionMaxDays: 90, maxChildSitemaps: 50, maxSampledChildren: 500, maxRedirectProbes: 200, redirectChainBudgetMs: 120_000,
});
// Snapshot keeps only these schema.org types by name; the rest count as `other`.
export const SCHEMA_ALLOWLIST = new Set([
  "AboutPage", "AggregateRating", "Article", "BlogPosting", "Book", "BreadcrumbList", "CollectionPage",
  "ContactPage", "Course", "CreativeWork", "Dataset", "DefinedTerm", "DefinedTermSet", "Event", "FAQPage",
  "HowTo", "ImageObject", "ItemList", "JobPosting", "ListItem", "LocalBusiness", "NewsArticle", "Offer",
  "Organization", "Person", "Product", "ProfilePage", "QAPage", "Question", "Answer", "Review",
  "SearchAction", "SoftwareApplication", "SoftwareSourceCode", "TechArticle", "VideoObject", "WebApplication",
  "WebPage", "WebSite",
]);
const DEPRECATED_SERP = new Set(["HowTo", "FAQPage"]);
const URL_KEYS = new Set(["url", "item", "image", "logo", "sameAs", "mainEntityOfPage", "contentUrl", "thumbnailUrl", "codeRepository", "isBasedOn", "downloadUrl", "installUrl"]);
const PLACEHOLDER_I = /lorem ipsum|\{\{[^}]*\}\}|\bexample\.(?:com|org)\b|\[(?:insert|placeholder)[^\]]*\]/i;
const PLACEHOLDER_S = /\b(?:REPLACE_?ME|TODO|TBD|FIXME|XXX)\b|\bYOUR_[A-Z_]+/;
const ROUTE_GRAMMAR = /^\/[a-z0-9/_.%-]{0,200}$/; // D-T ticket grammar

/**
 * The route if it is safe to carry in a snapshot or ticket, else null (r1 #7).
 * Same rule as hermes/agents/lib/seo-tickets.mjs safePath: the D-T grammar,
 * decoded once, printable ASCII, no `< > " ' \` { } | \\ ^ [ ]`, no `..`;
 * plus no `.` dot segments.
 */
export function ticketPath(p) {
  if (typeof p !== "string" || !ROUTE_GRAMMAR.test(p) || p.includes("..")) return null;
  let d;
  try { d = decodeURIComponent(p); } catch { return null; }
  if (!/^[\x21-\x7e]*$/.test(d) || /[<>"'`{}|\\^[\]]/.test(d) || d.includes("..") || /(^|\/)\.(\/|$)/.test(d)) return null;
  return p;
}
const PRINTABLE_PATH = /^\/[A-Za-z0-9/_.%~+-]{0,300}$/;

export const hash = (s) => createHash("sha256").update(String(s)).digest("hex").slice(0, 16);
const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const safePath = (p) => (PRINTABLE_PATH.test(p) && !p.includes("..") ? p : `path_hash:${hash(p)}`);

// ------------------------------------------------------------------ errors

export class FetchRefused extends Error {
  constructor(reason, code) { super(reason); this.reason = reason; this.code = code; }
}
export class GateAbort extends Error {
  constructor(reason) { super(reason); this.reason = reason; }
}
export class ConfigError extends Error {
  constructor(field, reason) { super(`${field} ${reason}`); this.field = field; this.reason = reason; }
}

// ---------------------------------------------------------------- tokenizer

const NAMED = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0", copy: "\u00a9", reg: "\u00ae",
  trade: "\u2122", hellip: "\u2026", mdash: "\u2014", ndash: "\u2013", lsquo: "\u2018", rsquo: "\u2019",
  ldquo: "\u201c", rdquo: "\u201d", middot: "\u00b7", bull: "\u2022", laquo: "\u00ab", raquo: "\u00bb",
  eacute: "\u00e9", egrave: "\u00e8", agrave: "\u00e0", ccedil: "\u00e7", euro: "\u20ac", times: "\u00d7",
  rarr: "\u2192", larr: "\u2190", shy: "\u00ad", zwj: "\u200d", zwnj: "\u200c",
};
export function decodeEntities(s) {
  if (!s.includes("&")) return s;
  return s.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[A-Za-z][A-Za-z0-9]*);?/g, (m, e) => {
    if (e[0] === "#") {
      const cp = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
    }
    return NAMED[e] ?? NAMED[e.toLowerCase()] ?? m;
  });
}

const RAW = new Set(["script", "style"]);
const RCDATA = new Set(["title", "textarea"]);
const INLINE = new Set(["a", "abbr", "b", "bdi", "bdo", "cite", "code", "data", "em", "i", "kbd", "mark", "q", "s", "small", "span", "strong", "sub", "sup", "time", "u", "var"]);
/** Text of a token stream: inline tags join without a gap, every other tag boundary is a space. */
function textOf(toks) {
  const parts = [];
  for (const t of toks) {
    if (t.type === "text") { if (!t.raw) parts.push(t.text); }
    else if (!INLINE.has(t.name)) parts.push(" ");
  }
  return norm(parts.join(""));
}
const isSpace = (c) => c === " " || c === "\n" || c === "\t" || c === "\r" || c === "\f";

/**
 * Tolerant tag-and-attribute tokenizer. Tag and attribute names are
 * lowercased, attribute order and quoting do not matter, the first of
 * duplicate attributes wins. Events: start {name, attrs, selfClosing},
 * end {name}, text {text, raw}.
 */
export function tokenize(src) {
  const out = [];
  const n = src.length;
  let i = 0;
  let textStart = 0;
  const pushText = (a, b) => { if (b > a) out.push({ type: "text", text: decodeEntities(src.slice(a, b)) }); };
  while (i < n) {
    const lt = src.indexOf("<", i);
    if (lt === -1) break;
    if (src.startsWith("<!--", lt)) {
      pushText(textStart, lt);
      const e = src.indexOf("-->", lt + 4);
      i = textStart = e === -1 ? n : e + 3;
      continue;
    }
    const c = src[lt + 1];
    if (c === "!" || c === "?") {
      pushText(textStart, lt);
      if (src.startsWith("<![CDATA[", lt)) {
        const e = src.indexOf("]]>", lt);
        out.push({ type: "text", text: src.slice(lt + 9, e === -1 ? n : e) });
        i = textStart = e === -1 ? n : e + 3;
      } else {
        const e = src.indexOf(">", lt);
        i = textStart = e === -1 ? n : e + 1;
      }
      continue;
    }
    const closing = c === "/";
    const nameStart = closing ? lt + 2 : lt + 1;
    const m = /^[A-Za-z][A-Za-z0-9:_-]*/.exec(src.slice(nameStart, nameStart + 64));
    if (!m) { i = lt + 1; continue; }
    pushText(textStart, lt);
    const name = m[0].toLowerCase();
    let j = nameStart + m[0].length;
    const attrs = Object.create(null);
    let selfClosing = false;
    while (j < n) {
      while (j < n && isSpace(src[j])) j++;
      if (j >= n) break;
      if (src[j] === ">") { j++; break; }
      if (src[j] === "/") {
        if (src[j + 1] === ">") { selfClosing = true; j += 2; break; }
        j++;
        continue;
      }
      let k = j;
      while (k < n && !isSpace(src[k]) && src[k] !== "=" && src[k] !== ">" && !(src[k] === "/" && src[k + 1] === ">")) k++;
      if (k === j) { j++; continue; }
      const an = src.slice(j, k).toLowerCase();
      j = k;
      while (j < n && isSpace(src[j])) j++;
      let val = "";
      if (src[j] === "=") {
        j++;
        while (j < n && isSpace(src[j])) j++;
        const q = src[j];
        if (q === '"' || q === "'") {
          const e = src.indexOf(q, j + 1);
          val = src.slice(j + 1, e === -1 ? n : e);
          j = e === -1 ? n : e + 1;
        } else {
          let e = j;
          while (e < n && !isSpace(src[e]) && src[e] !== ">") e++;
          val = src.slice(j, e);
          j = e;
        }
      }
      if (!(an in attrs)) attrs[an] = decodeEntities(val);
    }
    if (closing) out.push({ type: "end", name });
    else {
      out.push({ type: "start", name, attrs, selfClosing });
      if ((RAW.has(name) || RCDATA.has(name)) && !selfClosing) {
        const re = new RegExp(`</${name}[\\s>/]`, "ig");
        re.lastIndex = j;
        const mm = re.exec(src);
        const end = mm ? mm.index : n;
        const body = src.slice(j, end);
        out.push({ type: "text", text: RAW.has(name) ? body : decodeEntities(body), raw: RAW.has(name) });
        out.push({ type: "end", name });
        const gt = mm ? src.indexOf(">", end) : -1;
        j = gt === -1 ? n : gt + 1;
      }
    }
    i = textStart = j;
  }
  pushText(textStart, n);
  return out;
}

/** Compound selector: tag, #id, .class, [attr], [attr=value] (values case-insensitive). */
export function parseSelector(sel) {
  const m = /^([a-z][a-z0-9-]*)?((?:#[\w-]+|\.[\w-]+|\[[^\]]+\])*)$/i.exec(String(sel).trim());
  if (!m) throw new ConfigError("breadcrumb.selector", "unsupported");
  const parts = [];
  for (const p of m[2].match(/#[\w-]+|\.[\w-]+|\[[^\]]+\]/g) ?? []) {
    if (p[0] === "#") parts.push({ attr: "id", eq: p.slice(1).toLowerCase() });
    else if (p[0] === ".") parts.push({ attr: "class", token: p.slice(1).toLowerCase() });
    else {
      const a = /^\[\s*([\w:-]+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]*))\s*)?\]$/.exec(p);
      if (!a) throw new ConfigError("breadcrumb.selector", "unsupported");
      const v = a[2] ?? a[3] ?? a[4];
      parts.push(v === undefined ? { attr: a[1].toLowerCase() } : { attr: a[1].toLowerCase(), eq: v.toLowerCase() });
    }
  }
  const tag = m[1]?.toLowerCase();
  return (t) => {
    if (tag && t.name !== tag) return false;
    for (const p of parts) {
      const v = t.attrs[p.attr];
      if (v === undefined) return false;
      if (p.eq !== undefined && v.toLowerCase() !== p.eq) return false;
      if (p.token && !v.toLowerCase().split(/\s+/).includes(p.token)) return false;
    }
    return true;
  };
}

// ---------------------------------------------------------------- page facts

/** Extract the SEO facts of one server-rendered HTML document. */
export function extractPage(html, { breadcrumb, baseUrl = null } = {}) {
  const toks = tokenize(html);
  const f = {
    titles: [], descriptions: [], canonicals: [], robots: [], hreflang: [], og: {}, twitterCard: null,
    jsonld: [], h1: [], imgNoAlt: 0, links: new Set(), mixed: 0, text: "", crumbs: null,
  };
  // Only our-host paths are kept (never external URLs or raw href text).
  const base = baseUrl ? new URL(baseUrl) : null;
  const addLink = (href) => {
    if (!base || /^(mailto|tel|javascript|data):/i.test(href.trim())) return;
    let u;
    try { u = new URL(href.trim(), base); } catch { return; }
    if ((u.protocol === "https:" || u.protocol === "http:") && u.host === base.host) f.links.add(u.pathname);
  };
  const isHttp = (v) => typeof v === "string" && /^\s*http:\/\//i.test(v);
  const match = breadcrumb?.selector ? parseSelector(breadcrumb.selector) : null;
  const sepTok = breadcrumb?.separator ?? "/";
  const textParts = [];
  let svg = 0;
  let template = 0;
  const caps = []; // open captures: {name, nest, parts, kind, li}
  for (let x = 0; x < toks.length; x++) {
    const t = toks[x];
    if (t.type !== "text" && !INLINE.has(t.name)) {
      textParts.push(" ");
      for (const c of caps) { c.parts.push(" "); if (c.li) c.li.push(" "); }
    }
    if (t.type === "start") {
      for (const c of caps) if (c.name === t.name && !t.selfClosing) c.nest++;
      const a = t.attrs;
      switch (t.name) {
        case "svg": case "math": if (!t.selfClosing) svg++; break;
        case "template": if (!t.selfClosing) template++; break;
        case "title":
          if (svg === 0 && template === 0) f.titles.push(norm(toks[x + 1]?.type === "text" ? toks[x + 1].text : ""));
          x++; // skip the RCDATA text
          continue;
        case "script": {
          if (isHttp(a.src)) f.mixed++;
          const type = (a.type ?? "").split(";")[0].trim().toLowerCase();
          if (type === "application/ld+json" && template === 0) f.jsonld.push(toks[x + 1]?.type === "text" ? toks[x + 1].text : "");
          x++;
          continue;
        }
        case "style": x++; continue;
        case "meta": {
          const name = (a.name ?? "").toLowerCase();
          const prop = (a.property ?? "").toLowerCase();
          const content = a.content ?? "";
          if (name === "description") f.descriptions.push(norm(content));
          else if (name === "robots" || name === "googlebot" || name === "bingbot") f.robots.push(content.toLowerCase());
          const key = prop.startsWith("og:") ? prop : name.startsWith("og:") ? name : null;
          if (key && !(key in f.og)) f.og[key] = content;
          if ((name === "twitter:card" || prop === "twitter:card") && f.twitterCard === null) f.twitterCard = content;
          break;
        }
        case "link": {
          const rel = (a.rel ?? "").toLowerCase().split(/\s+/);
          if (rel.includes("canonical")) f.canonicals.push(a.href ?? "");
          if (rel.includes("stylesheet") && isHttp(a.href)) f.mixed++;
          if (rel.includes("alternate") && a.hreflang !== undefined) f.hreflang.push({ lang: a.hreflang.toLowerCase(), href: a.href ?? "" });
          break;
        }
        case "img": if (!("alt" in a)) f.imgNoAlt++; if (isHttp(a.src)) f.mixed++; break;
        case "a": if (a.href) addLink(a.href); break;
        case "iframe": case "source": case "video": case "audio": if (isHttp(a.src)) f.mixed++; break;
        case "h1": if (!t.selfClosing) caps.push({ name: "h1", nest: 1, parts: [], kind: "h1" }); break;
        case "li": for (const c of caps) if (c.kind === "crumb") c.li = []; break;
        default: break;
      }
      if (match && f.crumbs === null && !t.selfClosing && match(t) && !caps.some((c) => c.kind === "crumb")) {
        caps.push({ name: t.name, nest: 1, parts: [], kind: "crumb", items: [], li: null });
      }
    } else if (t.type === "end") {
      if (t.name === "svg" || t.name === "math") svg = Math.max(0, svg - 1);
      if (t.name === "template") template = Math.max(0, template - 1);
      if (t.name === "li") for (const c of caps) if (c.kind === "crumb" && c.li) { c.items.push(norm(c.li.join(""))); c.li = null; }
      for (let k = caps.length - 1; k >= 0; k--) {
        const c = caps[k];
        if (c.name !== t.name) continue;
        if (--c.nest > 0) continue;
        caps.splice(k, 1);
        const txt = norm(c.parts.join(""));
        if (c.kind === "h1") f.h1.push(txt);
        else {
          const sepNorm = norm(sepTok);
          const items = c.items.length ? c.items : txt.split(sepTok);
          f.crumbs = items.map(norm).filter((s) => s && s !== sepNorm);
        }
      }
    } else if (!t.raw && template === 0) {
      textParts.push(t.text);
      for (const c of caps) { c.parts.push(t.text); if (c.li) c.li.push(t.text); }
    }
  }
  f.text = norm(textParts.join(""));
  return f;
}

/** Parse JSON-LD blocks; @graph is flattened. Returns nodes and per-block issues. */
export function parseJsonLd(raws) {
  const nodes = [];
  const issues = [];
  raws.forEach((raw, block) => {
    let data;
    const body = raw.trim().replace(/^<!--/, "").replace(/-->$/, "");
    try { data = JSON.parse(body); } catch { issues.push({ kind: "parse-error", block }); return; }
    const top = Array.isArray(data) ? data : [data];
    for (const item of top) {
      if (!item || typeof item !== "object") { issues.push({ kind: "not-object", block }); continue; }
      const ctx = item["@context"];
      const members = Array.isArray(item["@graph"]) ? item["@graph"] : [];
      const own = item["@type"] !== undefined ? [item] : [];
      if (!own.length && !members.length) issues.push({ kind: "no-type", block });
      for (const node of [...own, ...members]) {
        if (!node || typeof node !== "object") continue;
        const types = [].concat(node["@type"] ?? []).filter((s) => typeof s === "string").map((s) => s.replace(/^(?:https?:\/\/schema\.org\/|schema:)/, ""));
        nodes.push({ node, types, context: node["@context"] ?? ctx, block });
      }
    }
  });
  return { nodes, issues };
}

const contextOk = (c) => {
  const ok = (s) => typeof s === "string" && /^https:\/\/schema\.org\/?$/.test(s);
  if (ok(c)) return true;
  if (Array.isArray(c)) return c.some(contextOk);
  return !!c && typeof c === "object" && ok(c["@vocab"]);
};

function walkJson(v, visit, key = "") {
  if (Array.isArray(v)) for (const x of v) walkJson(x, visit, key);
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walkJson(x, visit, k);
  else visit(key, v);
}

const htmlText = (s) => textOf(tokenize(String(s ?? "")));
const squash = (s) => s.replace(/\s+/g, "");
const visibleIn = (text, needle) => !!needle && (text.includes(needle) || squash(text).includes(squash(needle)));

// ---------------------------------------------------------------- robots and sitemap

export function parseRobots(txt) {
  const groups = [];
  const sitemaps = [];
  let cur = null;
  let lastWasAgent = false;
  for (const rawLine of String(txt).split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const val = m[2].trim();
    if (key === "user-agent") {
      if (!cur || !lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(val.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (key === "sitemap") sitemaps.push(val);
    else if ((key === "allow" || key === "disallow") && cur) cur.rules.push({ allow: key === "allow", path: val });
  }
  return { groups, sitemaps };
}

function ruleMatches(pattern, path) {
  if (pattern === "") return false;
  const anchored = pattern.endsWith("$");
  const body = (anchored ? pattern.slice(0, -1) : pattern).split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`).test(path);
}

/** Google-style evaluation: the token's own groups, else `*`; longest match wins, allow wins ties. */
export function robotsAllows(robots, token, path = "/") {
  const t = token.toLowerCase();
  let groups = robots.groups.filter((g) => g.agents.includes(t));
  if (!groups.length) groups = robots.groups.filter((g) => g.agents.includes("*"));
  let best = null;
  for (const r of groups.flatMap((g) => g.rules)) {
    if (!ruleMatches(r.path, path)) continue;
    const len = r.path.length;
    if (!best || len > best.len || (len === best.len && r.allow)) best = { len, allow: r.allow };
  }
  return best ? best.allow : true;
}

/** Minimal well-formedness plus <loc> and xhtml:link alternates. */
export function parseSitemap(xml) {
  const toks = tokenize(String(xml ?? ""));
  const stack = [];
  const entries = [];
  let root = null;
  let cur = null;
  let inLoc = false;
  let loc = "";
  for (const t of toks) {
    if (t.type === "start") {
      if (!stack.length && root) return { ok: false };
      if (!root) root = t.name;
      if (t.selfClosing) {
        if (t.name === "xhtml:link" && cur && (t.attrs.rel ?? "").toLowerCase() === "alternate") cur.alternates.push({ lang: (t.attrs.hreflang ?? "").toLowerCase(), href: t.attrs.href ?? "" });
        continue;
      }
      stack.push(t.name);
      if (t.name === "url" || t.name === "sitemap") cur = { loc: "", alternates: [] };
      if (t.name === "loc") { inLoc = true; loc = ""; }
    } else if (t.type === "end") {
      if (stack.pop() !== t.name) return { ok: false };
      if (t.name === "loc") { inLoc = false; if (cur) cur.loc = loc.trim(); }
      if ((t.name === "url" || t.name === "sitemap") && cur) { entries.push(cur); cur = null; }
    } else if (inLoc) loc += t.text;
    else if (!stack.length && t.text.trim()) return { ok: false };
  }
  if (stack.length || (root !== "urlset" && root !== "sitemapindex")) return { ok: false };
  return { ok: true, kind: root, entries };
}

// ---------------------------------------------------------------- config

const HOST_RE = /^[a-z0-9.-]+(?::\d+)?$/;

/** Validate a site config. Throws ConfigError (exit 2). */
export function validateConfig(cfg, { now = new Date() } = {}) {
  if (!cfg || typeof cfg !== "object") throw new ConfigError("config", "not-an-object");
  let origin;
  try { origin = new URL(cfg.canonical_origin); } catch { throw new ConfigError("canonical_origin", "invalid"); }
  if (origin.protocol !== "https:" || origin.pathname !== "/" || origin.search || origin.hash) throw new ConfigError("canonical_origin", "must-be-https-origin");
  const asset = cfg.asset_hosts ?? [];
  if (!Array.isArray(asset) || asset.some((h) => typeof h !== "string" || !HOST_RE.test(h))) throw new ConfigError("asset_hosts", "invalid");
  const pt = cfg.page_types ?? {};
  if (typeof pt !== "object" || Object.entries(pt).some(([k, v]) => !k.startsWith("/") || typeof v !== "string")) throw new ConfigError("page_types", "invalid");
  for (const [id, v] of Object.entries(cfg.l0p ?? {})) {
    if (!(id in L0P_DEFAULTS) || (v !== "block" && v !== "warn")) throw new ConfigError("l0p", "invalid");
  }
  const ai = cfg.ai_crawlers ?? "allow-all";
  if (!(ai === "allow-all" || ai === "block-training" || (typeof ai === "object" && Object.values(ai).every((v) => v === "allow" || v === "disallow")))) throw new ConfigError("ai_crawlers", "invalid");
  const locales = cfg.locales ?? [];
  if (!Array.isArray(locales)) throw new ConfigError("locales", "invalid");
  if (locales.length > 1 && !["html", "header", "sitemap"].includes(cfg.hreflang_mechanism)) throw new ConfigError("hreflang_mechanism", "required-for-localised-site");
  if (cfg.trailing_slash !== undefined && !["never", "always"].includes(cfg.trailing_slash)) throw new ConfigError("trailing_slash", "invalid");
  if (cfg.breadcrumb !== undefined) parseSelector(cfg.breadcrumb.selector ?? "");
  for (const [type, pol] of Object.entries(cfg.type_policies ?? {})) {
    if (!pol || (pol.require_schema !== undefined && !Array.isArray(pol.require_schema))) throw new ConfigError(`type_policies.${type}`, "invalid");
  }
  if (cfg.preview_hosts !== undefined) {
    if (!Array.isArray(cfg.preview_hosts)) throw new ConfigError("preview_hosts", "invalid");
    for (const re of cfg.preview_hosts) {
      if (typeof re !== "string" || !re.startsWith("^") || !re.endsWith("$") || re.endsWith("\\$")) throw new ConfigError("preview_hosts", "must-be-anchored-regex");
      try { previewHostRe(re); } catch { throw new ConfigError("preview_hosts", "invalid-regex"); }
    }
  }
  if (cfg.repository !== undefined && !REPO_RE.test(cfg.repository)) throw new ConfigError("repository", "must-be-owner/name");
  for (const k of ["single_locale_paths", "partial_locale_paths"]) {
    if (cfg[k] !== undefined && (!Array.isArray(cfg[k]) || cfg[k].some((x) => typeof x !== "string" || !x.startsWith("/")))) throw new ConfigError(k, "invalid");
  }
  validateExceptions(cfg.exceptions ?? [], now);
  return cfg;
}

/** R1d structure: exact paths, owner, reason, expires <= 90 days ahead, behaviour. Throws ConfigError. */
export function validateExceptions(list, now = new Date()) {
  if (!Array.isArray(list)) throw new ConfigError("exceptions", "not-a-list");
  const seen = new Set();
  for (const [i, e] of list.entries()) {
    const f = `exceptions[${i}]`;
    if (!e || typeof e.path !== "string" || !e.path.startsWith("/")) throw new ConfigError(f, "path-invalid");
    if (/[*?[\]{}]/.test(e.path)) throw new ConfigError(f, "glob-not-allowed");
    if (seen.has(e.path)) throw new ConfigError(f, "duplicate-path");
    seen.add(e.path);
    if (!e.owner || !e.reason) throw new ConfigError(f, "owner-and-reason-required");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.expires ?? "") || Number.isNaN(Date.parse(`${e.expires}T00:00:00Z`))) throw new ConfigError(f, "expires-invalid");
    const days = (Date.parse(`${e.expires}T00:00:00Z`) - now.getTime()) / 86_400_000;
    if (days > LIMITS.exceptionMaxDays) throw new ConfigError(f, "expires-over-90-days");
    const [kind, target] = String(e.behaviour ?? "").split(/\s+/);
    if (!BEHAVIOURS.includes(kind)) throw new ConfigError(f, "behaviour-invalid");
    if (kind === "canonical-to") {
      try { if (new URL(target).protocol !== "https:") throw 0; } catch { throw new ConfigError(f, "canonical-to-needs-https-url"); }
    }
  }
}

const exceptionExpired = (e, now) => Date.parse(`${e.expires}T23:59:59Z`) < now.getTime();

const SHA_RE = /^[0-9a-f]{40}$/;
const REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const BARE_ORIGIN_RE = /^https:\/\/([a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+)\/?$/;

/** A preview_hosts pattern, wrapped so an alternation cannot escape the anchors (r3 #2). */
const previewHostRe = (re) => new RegExp(`^(?:${re})$`);

/** Host of a bare `https://host` origin (no userinfo, port, path, query or fragment), else null. */
function bareOriginHost(s) {
  const m = BARE_ORIGIN_RE.exec(String(s ?? ""));
  return m ? m[1] : null;
}

/**
 * Preview authorisation (r1 #1). The validator has no token and no network
 * beyond the allowlist, so the receipt is bound locally: its host must match
 * a config `preview_hosts` regex, its repository must equal config
 * `repository`, and its sha must equal the caller's `--expected-sha`.
 */
function readReceipt(receipt, transportOrigin, cfg, expectedSha) {
  if (!Array.isArray(cfg.preview_hosts) || !cfg.preview_hosts.length) throw new ConfigError("preview_hosts", "required-for-preview");
  if (!REPO_RE.test(cfg.repository ?? "")) throw new ConfigError("repository", "required-for-preview");
  if (!SHA_RE.test(expectedSha ?? "")) throw new ConfigError("--expected-sha", "required-40-hex");
  const transportHost = bareOriginHost(transportOrigin);
  if (!transportHost) throw new ConfigError("transport", "must-be-bare-https-origin");
  if (!cfg.preview_hosts.some((re) => previewHostRe(re).test(transportHost))) throw new ConfigError("transport", "preview-host-not-allowed");
  if (!receipt || typeof receipt !== "object") throw new ConfigError("deployment-receipt", "missing");
  if (receipt.state !== "success") throw new ConfigError("deployment-receipt", "state-not-success");
  const sha = receipt.sha ?? receipt.deployment?.sha;
  if (sha !== expectedSha) throw new ConfigError("deployment-receipt", "sha-mismatch");
  const repo = typeof receipt.repository === "string" ? receipt.repository : receipt.repository_full_name ?? receipt.repository?.full_name;
  if (repo !== cfg.repository) throw new ConfigError("deployment-receipt", "repository-mismatch");
  const envHost = bareOriginHost(receipt.environment_url);
  if (!envHost) throw new ConfigError("deployment-receipt", "environment_url-invalid");
  if (!cfg.preview_hosts.some((re) => previewHostRe(re).test(envHost))) throw new ConfigError("deployment-receipt", "preview-host-not-allowed");
  if (envHost !== transportHost) throw new ConfigError("deployment-receipt", "transport-not-authorised");
  return { sha };
}

// ---------------------------------------------------------------- report

function newReport(cfg, level, mode, now) {
  const exceptions = new Map((cfg.exceptions ?? []).map((e) => [e.path, e]));
  return { cfg, level, mode, now, exceptions, fails: [], warns: [], notes: [], unmeasured: [], refused: [], activeExceptions: new Set(), coverage: null, sample: null, aborted: null };
}
const fail = (r, id, path, detail) => r.fails.push({ id, path, detail });
const warn = (r, id, path, detail) => r.warns.push({ id, path, detail });
function policy(r, id, path, detail) {
  const mode = r.cfg.l0p?.[id] ?? L0P_DEFAULTS[id];
  (mode === "block" ? fail : warn)(r, id, path, detail);
}
function exceptionFor(r, path) {
  const e = r.exceptions.get(path);
  if (e) r.activeExceptions.add(path);
  return e;
}
const behaviourOf = (e) => (e ? String(e.behaviour).split(/\s+/)[0] : null);

/** Lines and exit code for a finished report. */
export function formatReport(r) {
  const lines = [];
  const sortKey = (a, b) => (a.id + a.path).localeCompare(b.id + b.path);
  for (const x of [...r.fails].sort(sortKey)) lines.push(`${x.id} ${safePath(x.path)} ${x.detail}`);
  for (const x of [...r.warns].sort(sortKey)) lines.push(`warn ${x.id} ${safePath(x.path)} ${x.detail}`);
  // L0Q quarterly families: finding lines that never change the status line or exit code.
  for (const x of [...(r.quarterly ?? [])].sort(sortKey)) lines.push(`${x.id} ${ticketPath(x.path) ?? `path_hash=${hash(x.path)}`} ${x.detail}`);
  for (const x of r.refused) lines.push(`refused ${safePath(x.path)} ${x.reason}`);
  for (const x of r.unmeasured) lines.push(`not-measured ${safePath(x.path)} ${x.cls} ${x.reason}`);
  for (const x of r.notes) lines.push(`note ${x}`);
  if (r.coverage) lines.push(`coverage ${r.coverage}`);
  for (const p of [...r.activeExceptions].sort()) {
    const e = r.exceptions.get(p);
    lines.push(`exception ${safePath(p)} behaviour=${String(e.behaviour).replace(/\s+/g, ":")} owner=${String(e.owner).replace(/\s+/g, "_")} expires=${e.expires}`);
  }
  let code;
  if (r.aborted) { lines.push(`incomplete origin abort=${r.aborted}`); code = 3; }
  else if (r.fails.length) { lines.push(`fail count=${r.fails.length}`); code = 1; }
  else if (r.unmeasured.length || r.refused.length) {
    const cls = r.unmeasured.some((u) => u.cls === "waf") ? "waf" : "origin";
    lines.push(`incomplete ${cls} count=${r.unmeasured.length + r.refused.length}`);
    code = 3;
  } else if (r.sample) { lines.push(`pass-sampled rule=${r.sample.rule}`); code = 0; }
  else if (r.activeExceptions.size) { lines.push(`pass-with-exceptions count=${r.activeExceptions.size}`); code = 0; }
  else { lines.push("pass"); code = 0; }
  return { lines, code };
}

// ---------------------------------------------------------------- evaluation

function pageTypeOf(cfg, path) {
  let best = null;
  for (const [key, type] of Object.entries(cfg.page_types ?? {})) {
    const hit = key === "/" || !key.endsWith("/") ? path === key : path.startsWith(key) && path.length > key.length;
    if (hit && (!best || key.length > best.key.length)) best = { key, type };
  }
  return best?.type ?? "default";
}

const normUrl = (u) => { try { return new URL(u).href; } catch { return null; } };
/** X-Robots-Tag: unscoped directives, or ones scoped to googlebot or bingbot. */
function xRobotsNoindex(h) {
  for (const seg of h.split(/,(?=\s*[a-z0-9_-]+\s*:)/i)) {
    const m = /^\s*([a-z0-9_-]+)\s*:\s*(.*)$/i.exec(seg);
    const scoped = m && !/^(unavailable_after|max-snippet|max-image-preview|max-video-preview)$/i.test(m[1]);
    if (scoped && !/^(googlebot|bingbot)$/i.test(m[1])) continue;
    if (isNoindex(scoped ? m[2] : seg)) return true;
  }
  return false;
}
const isNoindex = (s) => /(^|[\s,:])(noindex|none)(\s*,|\s*$)/i.test(s);

/** Per-page checks. `page` = {path, status, bytes, html, headers}. Mutates page with derived facts. */
function evaluatePage(r, ctx, page) {
  const { cfg } = r;
  const f = extractPage(page.html, { breadcrumb: cfg.breadcrumb, baseUrl: ctx.expectedUrl(page.path) });
  page.f = f;
  page.type = pageTypeOf(cfg, page.path);
  const exc = exceptionFor(r, page.path);
  const beh = behaviourOf(exc);
  const xrt = ctx.ignoreXRobotsTag ? "" : String(page.headers?.["x-robots-tag"] ?? "");
  page.noindex = f.robots.some(isNoindex) || xRobotsNoindex(xrt);
  page.expected = ctx.expectedUrl(page.path);
  page.indexable = page.status === 200 && !page.noindex && beh !== "canonical-to";
  page.jsonld = parseJsonLd(f.jsonld);
  if (page.bytes > LIMITS.htmlMax) fail(r, "L0-11", page.path, `html-too-large bytes=${page.bytes}`);
  if (beh === "noindex" && !page.noindex) fail(r, "L0-06", page.path, "exception-expects-noindex");
  if (beh === "canonical-to") {
    const target = String(exc.behaviour).split(/\s+/)[1];
    if (f.canonicals.length !== 1 || normUrl(f.canonicals[0]) !== normUrl(target)) fail(r, "L0-03", page.path, `canonical-not-exception-target count=${f.canonicals.length}`);
  }
  if (!page.indexable) return;

  if (f.titles.length !== 1) fail(r, "L0-01", page.path, `title-count count=${f.titles.length}`);
  else if (!f.titles[0]) fail(r, "L0-01", page.path, "title-empty");
  if (f.descriptions.length > 1) fail(r, "L0-02", page.path, `description-count count=${f.descriptions.length}`);
  else if (f.descriptions.length === 1 && !f.descriptions[0]) fail(r, "L0-02", page.path, "description-empty");

  if (f.canonicals.length !== 1) fail(r, "L0-03", page.path, `canonical-count count=${f.canonicals.length}`);
  else {
    const c = f.canonicals[0];
    let u = null;
    try { u = new URL(c); } catch { /* relative or junk */ }
    if (!u || !/^https:\/\//i.test(c)) fail(r, "L0-03", page.path, `canonical-not-absolute-https hash=${hash(c)}`);
    else if (u.host !== ctx.prodHost) fail(r, "L0-03", page.path, `canonical-off-host host_hash=${hash(u.host)}`);
    else if (u.href !== normUrl(page.expected)) fail(r, "L0-03", page.path, `canonical-not-self canonical_hash=${hash(u.href)} expected_hash=${hash(normUrl(page.expected))}`);
  }

  const types = page.jsonld.nodes.flatMap((n) => n.types);
  for (const want of cfg.type_policies?.[page.type]?.require_schema ?? []) {
    const count = types.filter((t) => t === want).length;
    if (count !== 1) fail(r, "L0-11", page.path, `required-schema type=${want} count=${count}`);
  }

  if (atLeast(r.level, "L0P")) evaluatePolicy(r, ctx, page, types);
  evaluateWarnings(r, ctx, page, types);
}

function evaluatePolicy(r, ctx, page, types) {
  const { f, jsonld } = page;
  // L0P-01: present blocks parse, schema.org context, absolute URLs, no placeholders.
  for (const iss of jsonld.issues) policy(r, "L0P-01", page.path, `${iss.kind} block=${iss.block}`);
  const badCtx = new Set();
  for (const n of jsonld.nodes) {
    if (!contextOk(n.context) && !badCtx.has(n.block)) { badCtx.add(n.block); policy(r, "L0P-01", page.path, `context-invalid block=${n.block}`); }
  }
  const relSeen = new Set();
  let placeholder = false;
  for (const n of jsonld.nodes) {
    walkJson(n.node, (key, v) => {
      if (typeof v !== "string") return;
      if (URL_KEYS.has(key) && !/^https?:\/\//i.test(v) && !relSeen.has(`${n.block}:${key}`)) {
        relSeen.add(`${n.block}:${key}`);
        policy(r, "L0P-01", page.path, `url-not-absolute key=${key} block=${n.block}`);
      }
      if (!placeholder && (PLACEHOLDER_I.test(v) || PLACEHOLDER_S.test(v))) { placeholder = true; policy(r, "L0P-01", page.path, `placeholder block=${n.block}`); }
    });
  }

  // L0P-02: JSON-LD equals visible content.
  for (const n of jsonld.nodes.filter((x) => x.types.includes("FAQPage"))) {
    [].concat(n.node.mainEntity ?? []).forEach((q, k) => {
      if (!q || typeof q !== "object") return;
      if (!visibleIn(f.text, htmlText(q.name))) policy(r, "L0P-02", page.path, `faq-question-not-visible index=${k} hash=${hash(norm(q.name))}`);
      const ans = [].concat(q.acceptedAnswer ?? [])[0];
      if (!ans || !visibleIn(f.text, htmlText(ans.text))) policy(r, "L0P-02", page.path, `faq-answer-not-visible index=${k}`);
    });
  }
  const lists = jsonld.nodes.filter((x) => x.types.includes("BreadcrumbList"));
  if (r.cfg.breadcrumb?.selector) {
    if (f.crumbs && lists.length !== 1) policy(r, "L0P-02", page.path, `breadcrumb-schema-count count=${lists.length}`);
    if (!f.crumbs && lists.length) policy(r, "L0P-02", page.path, "breadcrumb-not-visible");
  }
  if (lists.length === 1) {
    const items = [].concat(lists[0].node.itemListElement ?? []).filter((x) => x && typeof x === "object");
    items.sort((a, b) => (Number(a.position) || 0) - (Number(b.position) || 0));
    const named = items.map((x) => norm(x.name ?? x.item?.name));
    if (f.crumbs && JSON.stringify(named) !== JSON.stringify(f.crumbs)) {
      policy(r, "L0P-02", page.path, `breadcrumb-mismatch shown=${f.crumbs.length} schema=${named.length} shown_hash=${hash(f.crumbs.join("|"))} schema_hash=${hash(named.join("|"))}`);
    }
    const last = items.at(-1);
    const lastUrl = typeof last?.item === "string" ? last.item : last?.item?.["@id"] ?? last?.item?.url;
    if (lastUrl && normUrl(lastUrl) !== normUrl(page.expected)) policy(r, "L0P-02", page.path, "breadcrumb-last-not-page");
  }

  // L0P-04: page-type tags, only where the site declares the type.
  if (SOCIAL_TYPES.has(page.type)) {
    const og = f.og;
    for (const k of ["og:title", "og:description", "og:url", "og:image"]) if (!og[k]) policy(r, "L0P-04", page.path, `missing tag=${k} type=${page.type}`);
    if (!f.twitterCard) policy(r, "L0P-04", page.path, `missing tag=twitter:card type=${page.type}`);
    if (og["og:url"] && f.canonicals[0] && normUrl(og["og:url"]) !== normUrl(f.canonicals[0])) policy(r, "L0P-04", page.path, "og-url-not-canonical");
    if (og["og:image"]) {
      let u = null;
      try { u = new URL(og["og:image"]); } catch { /* not absolute */ }
      if (!u || u.protocol !== "https:") policy(r, "L0P-04", page.path, "og-image-not-absolute-https");
      else if (!ctx.allowHosts.has(u.host)) {
        const m4 = r.cfg.l0p?.["L0P-04"] ?? L0P_DEFAULTS["L0P-04"];
        (m4 === "block" ? fail : warn)(r, "L0-host-not-allowlisted", page.path, `og:image host_hash=${hash(u.host)}`);
        policy(r, "L0P-04", page.path, "og-image-host-not-allowlisted");
      }
    }
    if (page.type === "catalog-item" && f.descriptions[0] && f.descriptions[0].length > 160) policy(r, "L0P-04", page.path, `catalog-description-too-long length=${f.descriptions[0].length}`);
    if (page.type === "guide") {
      const art = jsonld.nodes.find((n) => n.types.includes("Article") || n.types.includes("BlogPosting"));
      if (!art) policy(r, "L0P-04", page.path, "guide-article-missing");
      else if (!art.node.datePublished || !art.node.dateModified) policy(r, "L0P-04", page.path, "guide-dates-missing");
    }
  }
}

function evaluateWarnings(r, ctx, page, types) {
  const { f } = page;
  const t = f.titles[0] ?? "";
  if (t && (t.length < 30 || t.length > 60)) warn(r, "R1c", page.path, `title-length length=${t.length}`);
  const d = f.descriptions[0];
  if (d && (d.length < 70 || d.length > 160)) warn(r, "R1c", page.path, `description-length length=${d.length}`);
  if (f.h1.length !== 1) warn(r, "R1c", page.path, `h1-count count=${f.h1.length}`);
  if (f.imgNoAlt) warn(r, "R1c", page.path, `img-without-alt count=${f.imgNoAlt}`);
  if (f.links.size < 3) warn(r, "R1c", page.path, `internal-links count=${f.links.size}`);
  const q = r.cfg.owner_queries?.[page.path];
  if (q && !t.toLowerCase().includes(String(q).toLowerCase())) warn(r, "R1c", page.path, "owner-query-not-in-title");
  for (const x of new Set(types)) if (DEPRECATED_SERP.has(x)) warn(r, "R1c", page.path, `deprecated-serp-schema type=${x}`);
}

function evaluateRobots(r, ctx, robots) {
  // robots = {status, body} | {missing:true}
  if (!robots) return;
  if (robots.status >= 500) { fail(r, "L0-08", "/robots.txt", `status=${robots.status} reads-as-disallow-all`); return; }
  if (robots.status !== 200 && robots.status !== 404) { fail(r, "L0-08", "/robots.txt", `status=${robots.status}`); return; }
  if (robots.status !== 200) { r.notes.push(`robots-absent status=${robots.status}`); return; }
  const parsed = parseRobots(robots.body);
  ctx.robots = parsed;
  const onHost = parsed.sitemaps.filter((s) => { try { return new URL(s).host === ctx.prodHost; } catch { return false; } });
  if (!onHost.length) fail(r, "L0-08", "/robots.txt", `sitemap-not-declared declared=${parsed.sitemaps.length}`);
  for (const bot of ["Googlebot", "Bingbot"]) if (!robotsAllows(parsed, bot, "/")) fail(r, "L0-08", "/robots.txt", `disallows-root bot=${bot}`);
  if (atLeast(r.level, "L0P")) {
    const pol = r.cfg.ai_crawlers ?? "allow-all";
    const want = (tok) => (typeof pol === "object" ? pol[tok] ?? null : pol === "allow-all" ? "allow" : AI_SEARCH.includes(tok) ? "allow" : "disallow");
    for (const tok of [...AI_SEARCH, ...AI_TRAINING]) {
      const w = want(tok);
      if (!w) continue;
      const got = robotsAllows(parsed, tok, "/") ? "allow" : "disallow";
      if (got !== w) policy(r, "L0P-03", "/robots.txt", `ai-crawler-policy bot=${tok} expected=${w} observed=${got}`);
    }
  }
}

/** Site-level checks over all measured pages. */
function evaluateSite(r, ctx, pages, sitemap) {
  const { cfg } = r;
  const indexable = [...pages.values()].filter((p) => p.indexable);

  // Duplicate sets (one blocker per set).
  const dupes = (id, kind, pick) => {
    const by = new Map();
    for (const p of indexable) { const v = pick(p); if (v) by.set(v, [...(by.get(v) ?? []), p.path]); }
    for (const [v, paths] of by) if (paths.length > 1) {
      const list = paths.sort();
      fail(r, id, list[0], `duplicate-${kind} set_size=${list.length} hash=${hash(v)} paths=${list.map(safePath).join(",")}`);
    }
  };
  dupes("L0-01", "title", (p) => (p.f.titles.length === 1 ? p.f.titles[0] : null));
  const uniqueTypes = cfg.unique_description_types ? new Set(cfg.unique_description_types) : null;
  const descScope = (p) => (uniqueTypes ? uniqueTypes.has(p.type) : p.type !== "paginated" && p.type !== "legal");
  dupes("L0-02", "description", (p) => (descScope(p) && p.f.descriptions.length === 1 ? p.f.descriptions[0] : null));

  // L0-07 sitemap.
  const sitemapPaths = [];
  if (!sitemap.found) { fail(r, "L0-07", "/sitemap.xml", "sitemap-missing"); }
  else if (!sitemap.ok) { fail(r, "L0-07", sitemap.path ?? "/sitemap.xml", "sitemap-invalid-xml"); }
  if (sitemap.ok) {
    const seen = new Set();
    let dup = 0;
    for (const loc of sitemap.locs) {
      if (seen.has(loc)) { dup++; continue; }
      seen.add(loc);
      let u = null;
      try { u = new URL(loc); } catch { /* invalid */ }
      if (!u || u.protocol !== "https:" || u.host !== ctx.prodHost) { fail(r, "L0-07", u ? u.pathname : "-", `sitemap-url-off-host hash=${hash(loc)}`); continue; }
      sitemapPaths.push(u.pathname + u.search);
    }
    if (dup) fail(r, "L0-07", "/sitemap.xml", `sitemap-duplicates count=${dup}`);
  }
  const inSitemap = new Set(sitemapPaths);
  r.sitemapPathsList = sitemapPaths;
  r.sitemapCount = sitemapPaths.length;
  let excused = 0;
  for (const path of sitemapPaths) {
    const page = pages.get(path);
    const exc = r.exceptions.get(path);
    if (!page) {
      if (r.mode === "build") {
        if (behaviourOf(exc) === "dynamic-live-only") { exceptionFor(r, path); excused++; }
        else fail(r, "L0-07", path, "sitemap-url-no-built-page");
      }
      continue;
    }
    if (page.status !== 200) fail(r, "L0-07", path, `sitemap-url-status status=${page.status}`);
    if (page.noindex) fail(r, "L0-06", path, "noindex-in-sitemap");
    if (behaviourOf(exc) === "canonical-to") fail(r, "L0-07", path, "sitemap-url-not-self-canonical");
  }
  if (r.mode === "build") {
    for (const p of indexable) if (!inSitemap.has(p.path)) fail(r, "L0-07", p.path, "indexable-page-not-in-sitemap");
  }
  if (ctx.routeManifest) {
    const manifest = new Set(ctx.routeManifest);
    for (const route of manifest) {
      const b = behaviourOf(r.exceptions.get(route));
      if (!inSitemap.has(route) && b !== "noindex" && b !== "canonical-to" && !(pages.get(route)?.noindex)) fail(r, "L0-07", route, "route-not-in-sitemap");
    }
    for (const path of sitemapPaths) if (!manifest.has(path)) fail(r, "L0-07", path, "sitemap-url-not-in-route-manifest");
  }

  // L0-10 hreflang on localised sites.
  if ((cfg.locales ?? []).length > 1) evaluateHreflang(r, ctx, pages, sitemap);

  // L0-12 coverage and vacuous-pass guards.
  const measured = [...pages.values()].length;
  const tested = sitemapPaths.filter((p) => pages.has(p)).length;
  const routeTotal = ctx.routeManifest ? ctx.routeManifest.length : r.mode === "build" ? measured : null;
  const routeTested = ctx.routeManifest ? ctx.routeManifest.filter((p) => pages.has(p)).length : routeTotal;
  r.coverage = `mode=${r.mode} level=${r.level} sitemap_tested=${tested}/${sitemapPaths.length} routes_tested=${routeTotal === null ? "n/a" : `${routeTested}/${routeTotal}`} pages=${measured}${excused ? ` excused=${excused}` : ""}`;
  if (measured === 0) fail(r, "L0-12", "-", "zero-pages");
  if (sitemap.childrenOverCap) fail(r, "L0-12", "/sitemap.xml", `sitemap-children-over-cap children=${sitemap.childrenOverCap} max=${LIMITS.maxChildSitemaps}`);
  if (sitemap.childrenSelectedOverCap) fail(r, "L0-12", "/sitemap.xml", `sitemap-children-over-cap selected=${sitemap.childrenSelectedOverCap} max=${LIMITS.maxSampledChildren}`);
  if (sitemap.childrenSampled) r.notes.push(`sitemap-children-sampled children=${sitemap.childrenSampled.children} fetched=${sitemap.childrenSampled.fetched} rule=${sitemap.sampleRule}`);
  if (sitemap.ok && sitemapPaths.length === 0) fail(r, "L0-12", "/sitemap.xml", "empty-sitemap");
  const famPaths = r.mode === "build" ? [...pages.keys()] : sitemapPaths;
  for (const [key, type] of Object.entries(cfg.page_types ?? {})) {
    if (!famPaths.some((p) => pageTypeOf(cfg, p) === type)) fail(r, "L0-12", key, `family-empty type=${type}`);
  }
  if (atLeast(r.level, "L0P") && cfg.breadcrumb?.selector && measured && ![...pages.values()].some((p) => p.f?.crumbs)) fail(r, "L0-12", "-", "family-empty family=breadcrumb");
  if (!r.sample && r.mode === "live" && tested + r.unmeasured.length + r.refused.length + (r.tooLarge ?? 0) + (r.nonHtml ?? 0) < sitemapPaths.length) fail(r, "L0-12", "-", `incomplete-coverage tested=${tested} total=${sitemapPaths.length}`);

  // R1d caps (expiry is checked up front).
  const n = (cfg.exceptions ?? []).length;
  const cap = Math.max(1, Math.floor(sitemapPaths.length * LIMITS.exceptionShare));
  if (n > LIMITS.maxExceptions) fail(r, "L0-exceptions", "-", `over-cap entries=${n} max=${LIMITS.maxExceptions}`);
  else if (n > cap) fail(r, "L0-exceptions", "-", `over-share entries=${n} max=${cap} sitemap=${sitemapPaths.length}`);
}

// ---------------------------------------------------------------- L0Q quarterly families

const qfind = (r, id, path, detail) => (r.quarterly ??= []).push({ id, path, detail });

/**
 * Quarterly families (`--level L0Q`): mixed content, URL length, orphans and
 * crawl depth over crawled pages. Findings never change the exit code.
 */
function evaluateQuarterly(r, pages) {
  const crawled = [...pages.values()].filter((p) => p.status === 200 && p.f);
  for (const p of crawled) if (p.f.mixed) qfind(r, "Q-mixed-content", p.path, `count=${p.f.mixed}`);
  const sitemapPaths = r.sitemapPathsList ?? [];
  for (const path of new Set([...sitemapPaths, ...crawled.map((p) => p.path)])) if (path.length > 115) qfind(r, "Q-url-length", path, `len=${path.length}`);
  if (r.sample) { r.notes.push("L0Q orphan-and-depth=skipped-sampled"); return; }
  const inbound = new Map();
  for (const p of crawled) for (const l of p.f.links) if (l !== p.path) inbound.set(l, (inbound.get(l) ?? 0) + 1);
  for (const path of sitemapPaths) if (!inbound.get(path)) qfind(r, "Q-orphan", path, "inbound=0");
  const byPath = new Map(crawled.map((p) => [p.path, p]));
  if (!byPath.has("/")) { r.notes.push("L0Q crawl-depth=skipped-home-not-crawled"); return; }
  const depth = new Map([["/", 0]]);
  const queue = ["/"];
  while (queue.length) {
    const cur = queue.shift();
    for (const l of [...byPath.get(cur).f.links].sort()) {
      if (!byPath.has(l) || depth.has(l)) continue;
      depth.set(l, depth.get(cur) + 1);
      queue.push(l);
    }
  }
  for (const [path, d] of depth) if (d > 3) qfind(r, "Q-crawl-depth", path, `depth=${d}`);
}

/**
 * Q-redirect-chain (live only): each distinct internal link target, at most
 * 200 per run, followed hop by hop over https within our host; more than one
 * redirect is a finding. Fetch errors are counted, never findings. A
 * GateAbort or the total time budget stops the probe with a note, so L0Q can
 * never change the status line (r3 #1, #3).
 */
export async function probeRedirectChains(r, pages, hop, { budgetMs = LIMITS.redirectChainBudgetMs, clock = Date.now } = {}) {
  const start = clock();
  let stop = null;
  const known = new Set([...pages.values()].filter((p) => p.status === 200).map((p) => p.path));
  const all = [...new Set([...pages.values()].flatMap((p) => [...(p.f?.links ?? [])]))].filter((l) => !known.has(l)).sort();
  const targets = all.slice(0, LIMITS.maxRedirectProbes);
  if (all.length > targets.length) r.notes.push(`L0Q redirect-chain-probes=${targets.length}/${all.length}`);
  let errors = 0;
  const overBudget = () => { if (!stop && clock() - start >= budgetMs) stop = "budget"; return stop !== null; };
  await pool(targets, LIMITS.concurrency, async (path) => {
    let cur = path;
    let hops = 0;
    try {
      while (hops <= LIMITS.maxHops) {
        if (overBudget()) return;
        const res = await hop(cur);
        if (![301, 302, 303, 307, 308].includes(res.status) || !res.headers?.location) break;
        const next = res.next(res.headers.location);
        hops++;
        if (!next) break;
        cur = next;
      }
    } catch (e) {
      if (e instanceof GateAbort) { stop ??= "aborted"; return; }
      errors++;
    }
    if (hops > 1) qfind(r, "Q-redirect-chain", path, `hops=${hops}`);
  });
  if (errors) r.notes.push(`L0Q redirect-chain-errors=${errors}`);
  if (stop === "aborted") r.notes.push("L0Q redirect-chain-aborted=1");
  if (stop === "budget") r.notes.push("L0Q redirect-chain-skipped=budget");
}

function evaluateHreflang(r, ctx, pages, sitemap) {
  const mech = r.cfg.hreflang_mechanism;
  const altsOf = (p) => {
    if (mech === "html") return p.f.hreflang;
    if (mech === "header") return parseLinkHeader(String(p.headers?.link ?? ""));
    return sitemap.alternates?.get(p.path) ?? [];
  };
  const cfg = r.cfg;
  const locales = new Set((cfg.locales ?? []).map((l) => String(l).toLowerCase()));
  const under = (path, list) => (list ?? []).some((pfx) => path.startsWith(pfx));
  const sets = new Map();
  for (const p of pages.values()) if (p.indexable) sets.set(p.path, altsOf(p));
  let any = false;
  for (const [path, alts] of sets) {
    if (!alts.length) {
      if (!under(path, cfg.single_locale_paths)) fail(r, "L0-10", path, "hreflang-missing");
      continue;
    }
    any = true;
    const declared = new Set(alts.map((a) => a.lang));
    const foreign = [...declared].filter((l) => (l === "x-default" ? !cfg.hreflang_x_default : !locales.has(l)));
    if (foreign.length) fail(r, "L0-10", path, `hreflang-locale-not-configured count=${foreign.length}`);
    if (!under(path, cfg.partial_locale_paths)) {
      const missing = [...locales].filter((l) => !declared.has(l));
      if (missing.length) fail(r, "L0-10", path, `hreflang-locale-missing count=${missing.length}`);
    }
    const urls = new Set();
    const pairs = new Set();
    let selfRef = false;
    const self = normUrl(ctx.expectedUrl(path));
    const langs = new Set();
    for (const a of alts) {
      if (!/^(x-default|[a-z]{2,3}(-[a-z0-9]{2,8})*)$/.test(a.lang)) fail(r, "L0-10", path, `hreflang-invalid-code hash=${hash(a.lang)}`);
      if (langs.has(a.lang)) fail(r, "L0-10", path, `hreflang-duplicate-code hash=${hash(a.lang)}`);
      langs.add(a.lang);
      let u = null;
      try { u = new URL(a.href); } catch { /* relative */ }
      if (!u || u.protocol !== "https:") { fail(r, "L0-10", path, "hreflang-not-absolute-https"); continue; }
      if (!ctx.allowHosts.has(u.host) && u.host !== ctx.prodHost) { fail(r, "L0-host-not-allowlisted", path, `hreflang host_hash=${hash(u.host)}`); continue; }
      if (u.host !== ctx.prodHost) { fail(r, "L0-10", path, `hreflang-off-host host_hash=${hash(u.host)}`); continue; }
      urls.add(u.href);
      pairs.add(`${a.lang}=${u.href}`);
      if (u.href === self && a.lang !== "x-default") selfRef = true;
    }
    if (!selfRef) fail(r, "L0-10", path, "hreflang-no-self-reference");
    if (r.cfg.hreflang_x_default && !langs.has("x-default")) fail(r, "L0-10", path, "hreflang-x-default-missing");
    for (const target of urls) {
      const tp = new URL(target).pathname;
      if (tp === path) continue;
      const tAlts = sets.get(tp);
      if (!tAlts) {
        if (r.sample) r.notes.push(`hreflang-target-not-sampled ${safePath(tp)}`);
        else fail(r, "L0-10", path, `hreflang-target-not-measured target=${safePath(tp)}`);
        continue;
      }
      const tPairs = new Set(tAlts.map((a) => `${a.lang}=${normUrl(a.href)}`));
      if (!tAlts.some((a) => a.lang !== "x-default" && normUrl(a.href) === self)) fail(r, "L0-10", path, `hreflang-not-reciprocal target=${safePath(tp)}`);
      else if (tPairs.size !== pairs.size || [...pairs].some((x) => !tPairs.has(x))) fail(r, "L0-10", path, `hreflang-cluster-mismatch target=${safePath(tp)}`);
    }
  }
  if (!any) fail(r, "L0-12", "-", "family-empty family=hreflang");
}

function parseLinkHeader(h) {
  const out = [];
  for (const part of h.split(/,(?=\s*<)/)) {
    const m = /<([^>]*)>(.*)/.exec(part.trim());
    if (!m) continue;
    const params = Object.fromEntries([...m[2].matchAll(/;\s*([\w-]+)\s*=\s*"?([^";]*)"?/g)].map((x) => [x[1].toLowerCase(), x[2]]));
    if ((params.rel ?? "").toLowerCase().split(/\s+/).includes("alternate") && params.hreflang) out.push({ lang: params.hreflang.toLowerCase(), href: m[1] });
  }
  return out;
}

function checkExceptionExpiry(r) {
  for (const e of r.cfg.exceptions ?? []) if (exceptionExpired(e, r.now)) fail(r, "L0-exceptions", e.path, `expired expires=${e.expires}`);
}

function makeCtx(cfg, prodOrigin, extra = {}) {
  const prod = new URL(prodOrigin);
  const trailing = cfg.trailing_slash;
  return {
    prodHost: prod.host,
    prodOrigin: prod.origin,
    expectedUrl: (path) => `${prod.origin}${path}`,
    trailing,
    allowHosts: new Set([prod.host, ...(cfg.asset_hosts ?? [])]),
    routeManifest: null,
    ...extra,
  };
}

// ---------------------------------------------------------------- build mode

function readMaybe(dir, names) {
  for (const n of names) { const p = join(dir, n); if (existsSync(p) && statSync(p).isFile()) return readFileSync(p, "utf8"); }
  return null;
}

/** Run the build-mode gate over a static output directory. */
export function runBuild(dir, cfg, { level = "L0", now = new Date(), configDir = process.cwd() } = {}) {
  const r = newReport(cfg, level, "build", now);
  const ctx = makeCtx(cfg, cfg.canonical_origin);
  if (cfg.route_manifest) ctx.routeManifest = JSON.parse(readFileSync(resolve(configDir, cfg.route_manifest), "utf8"));
  checkExceptionExpiry(r);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) throw new ConfigError("build-dir", "missing");
  const skip = new Set(cfg.skip_paths ?? DEFAULT_SKIP);
  const pages = new Map();
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) { walk(p); continue; }
      if (!name.endsWith(".html")) continue;
      let rel = `/${relative(dir, p).split(sep).join("/").replace(/\.html$/, "")}`;
      if (rel === "/index") rel = "/";
      else if (rel.endsWith("/index")) rel = rel.slice(0, -6) + (cfg.trailing_slash === "always" ? "/" : "");
      else if (cfg.trailing_slash === "always") rel += "/";
      if (skip.has(rel)) continue;
      const html = readFileSync(p, "utf8");
      let headers = {};
      const metaFile = p.replace(/\.html$/, ".meta");
      if (existsSync(metaFile)) {
        try { headers = Object.fromEntries(Object.entries(JSON.parse(readFileSync(metaFile, "utf8")).headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)])); } catch { /* not Next meta */ }
      }
      pages.set(rel, { path: rel, status: 200, bytes: Buffer.byteLength(html), html, headers });
    }
  };
  walk(dir);
  for (const page of pages.values()) evaluatePage(r, ctx, page);

  const robotsBody = cfg.robots_file ? readMaybe(configDir, [cfg.robots_file]) : readMaybe(dir, ["robots.txt.body", "robots.txt"]);
  evaluateRobots(r, ctx, robotsBody === null ? { status: 404 } : { status: 200, body: robotsBody });

  const sitemap = { found: false, ok: false, locs: [], alternates: new Map() };
  const smBody = cfg.sitemap_file ? readMaybe(configDir, [cfg.sitemap_file]) : readMaybe(dir, ["sitemap.xml.body", "sitemap.xml"]);
  if (smBody !== null) {
    sitemap.found = true;
    collectSitemap(sitemap, smBody, ctx, (loc) => {
      const rel = new URL(loc).pathname.replace(/^\//, "");
      return readMaybe(dir, [`${rel}.body`, rel]);
    }, 0);
  }
  evaluateSite(r, ctx, pages, sitemap);
  if (atLeast(level, "L0Q")) { evaluateQuarterly(r, pages); r.notes.push("L0Q redirect-chain=skipped-build-mode"); }
  if (!readMaybe(dir, ["llms.txt.body", "llms.txt"]) && !(cfg.static_dir && readMaybe(resolve(configDir, cfg.static_dir), ["llms.txt"]))) warn(r, "R1c", "/llms.txt", "llms-txt-absent");
  return r;
}

/**
 * Children of a sitemap index to load (r2 #3). Up to 50: all. Over 50
 * without a sample: the first 50 and an L0-12 failure. With a sample: the
 * rule applied to the full child list (deterministic), all selected children
 * loaded, at most 500; more than 500 selected is an L0-12 failure.
 */
function chooseChildren(sitemap, entries) {
  if (entries.length <= LIMITS.maxChildSitemaps) return entries;
  if (!sitemap.sampleRule) {
    sitemap.childrenOverCap = Math.max(sitemap.childrenOverCap ?? 0, entries.length);
    return entries.slice(0, LIMITS.maxChildSitemaps);
  }
  const selected = applySample(entries, sitemap.sampleRule);
  sitemap.childrenSampled = { children: entries.length, fetched: Math.min(selected.length, LIMITS.maxSampledChildren) };
  if (selected.length > LIMITS.maxSampledChildren) sitemap.childrenSelectedOverCap = selected.length;
  return selected.slice(0, LIMITS.maxSampledChildren);
}

function collectSitemap(sitemap, body, ctx, loadChild, depth) {
  const parsed = parseSitemap(body);
  if (!parsed.ok) { sitemap.ok = false; sitemap.invalid = true; return; }
  if (!sitemap.invalid) sitemap.ok = true;
  if (parsed.kind === "urlset") {
    for (const e of parsed.entries) {
      sitemap.locs.push(e.loc);
      if (e.alternates.length) { try { sitemap.alternates.set(new URL(e.loc).pathname, e.alternates); } catch { /* off */ } }
    }
    return;
  }
  if (depth >= 2) { sitemap.ok = false; sitemap.invalid = true; return; }
  for (const e of chooseChildren(sitemap, parsed.entries)) {
    let u = null;
    try { u = new URL(e.loc); } catch { /* invalid */ }
    if (!u || u.host !== ctx.prodHost) { sitemap.ok = false; sitemap.invalid = true; continue; }
    const child = loadChild(e.loc);
    if (child === null || child === undefined) { sitemap.ok = false; sitemap.invalid = true; continue; }
    collectSitemap(sitemap, child, ctx, loadChild, depth + 1);
  }
}

// ---------------------------------------------------------------- fetch guard (R1e)

const BLOCK4 = new net.BlockList();
for (const [a, p] of [["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4]]) BLOCK4.addSubnet(a, p, "ipv4");
// IPv6 prefixes refused outright, including every form that embeds or
// translates an IPv4 address (r1 #2): blocking beats decoding.
const BLOCK6 = [
  ["::", 96], // unspecified, loopback, IPv4-compatible ::a.b.c.d
  ["::ffff:0:0", 96], // IPv4-mapped
  ["::ffff:0:0:0", 96], // IPv4-translated
  ["64:ff9b::", 96], // NAT64 well-known
  ["64:ff9b:1::", 48], // NAT64 local-use
  ["100::", 64], // discard
  ["2001::", 32], // Teredo
  ["2001:db8::", 32], // documentation
  ["2002::", 16], // 6to4
  ["fc00::", 7], // unique local (fd00::/8, fd00:ec2::254 metadata)
  ["fe80::", 10], // link-local
  ["fec0::", 10], // site-local
  ["ff00::", 8], // multicast
].map(([a, bits]) => ({ words: expand6(a), bits }));
const inPrefix6 = (w, { words, bits }) => {
  for (let k = 0; k < 8 && bits > 0; k++, bits -= 16) {
    const mask = bits >= 16 ? 0xffff : (0xffff << (16 - bits)) & 0xffff;
    if ((w[k] & mask) !== (words[k] & mask)) return false;
  }
  return true;
};

function expand6(a) {
  let s = a.toLowerCase().split("%")[0];
  const v4 = /(\d+\.\d+\.\d+\.\d+)$/.exec(s);
  if (v4) { const o = v4[1].split(".").map(Number); s = s.slice(0, -v4[1].length) + `${((o[0] << 8) | o[1]).toString(16)}:${((o[2] << 8) | o[3]).toString(16)}`; }
  const [h, t] = s.split("::");
  const head = h ? h.split(":") : [];
  const tail = t !== undefined ? (t ? t.split(":") : []) : [];
  const mid = t !== undefined ? Array(8 - head.length - tail.length).fill("0") : [];
  return [...head, ...mid, ...tail].map((x) => parseInt(x || "0", 16));
}

/** True when an address must never be connected to (private, loopback, link-local, unique-local, metadata, reserved). */
export function isUnsafeAddress(address, { allowLoopback = false } = {}) {
  const fam = net.isIP(String(address).split("%")[0]);
  if (fam === 4) {
    if (allowLoopback && address.startsWith("127.")) return false;
    return BLOCK4.check(address, "ipv4");
  }
  if (fam === 6) {
    const w = expand6(address);
    if (w.length !== 8 || w.some((x) => Number.isNaN(x) || x < 0 || x > 0xffff)) return true;
    if (allowLoopback && w.slice(0, 7).every((x) => x === 0) && w[7] === 1) return false;
    return BLOCK6.some((pfx) => inPrefix6(w, pfx));
  }
  return true;
}

/** Reject with `timeout` when `promise` has not settled by `deadline` (ms epoch). */
function withDeadline(promise, deadline, onTimeout) {
  const left = deadline - Date.now();
  if (left <= 0) { onTimeout?.(); return Promise.reject(new FetchRefused("timeout")); }
  let timer;
  const t = new Promise((_, rej) => { timer = setTimeout(() => { onTimeout?.(); rej(new FetchRefused("timeout")); }, left); });
  return Promise.race([promise, t]).finally(() => clearTimeout(timer));
}

/**
 * Build a resolver that asks for every A and AAAA record in parallel. Both
 * answers are needed (all addresses are vetted), so a stalled family stalls
 * the lookup and the caller's deadline refuses it. `impl` is injectable.
 */
export function makeResolver(impl = null) {
  return async (host, { timeoutMs = LIMITS.timeoutMs } = {}) => {
    let r = impl;
    if (!r) {
      const res = new dnsp.Resolver({ timeout: Math.max(1, Math.min(timeoutMs, 5000)), tries: 1 });
      r = { resolve4: (h) => res.resolve4(h), resolve6: (h) => res.resolve6(h), cancel: () => res.cancel() };
    }
    const deadline = Date.now() + timeoutMs;
    const ask = async (fn, family) => {
      try { return (await fn(host)).map((address) => ({ address, family })); } catch (e) {
        if (e.code === "ENODATA" || e.code === "ENOTFOUND") return { miss: e.code };
        throw new FetchRefused("dns-error", e.code);
      }
    };
    const answers = await withDeadline(Promise.all([ask(r.resolve4, 4), ask(r.resolve6, 6)]), deadline, () => r.cancel?.());
    const out = answers.filter(Array.isArray).flat();
    if (!out.length) throw new FetchRefused("dns-unresolved");
    return out;
  };
}

/** Resolve every A and AAAA record (no getaddrinfo, no hosts file). */
export const defaultResolver = makeResolver();

/**
 * One HTTP(S) request to an already vetted address. The custom `lookup`
 * hands the socket the vetted IP, so Node never resolves the name again;
 * TLS SNI and the Host header keep the hostname. No cookies, no agent reuse.
 */
export function nodeRequest({ url, host, address, family, maxBytes = LIMITS.maxBytes, timeoutMs = LIMITS.timeoutMs, method = "GET" }) {
  return new Promise((resolveP, rejectP) => {
    const u = new URL(url);
    const mod = u.protocol === "https:" ? https : http;
    let settled = false;
    const done = (fn, v) => { if (!settled) { settled = true; clearTimeout(timer); fn(v); } };
    const options = {
      method, hostname: host, port: u.port || undefined, path: `${u.pathname}${u.search}`, agent: false,
      headers: { "user-agent": `seo-gate/${VERSION} (+https://github.com/tristanroth1)`, accept: "text/html,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5", "accept-encoding": "gzip, identity" },
      lookup: (_h, o, cb) => (o && o.all ? cb(null, [{ address, family }]) : cb(null, address, family)),
    };
    if (mod === https && !net.isIP(host)) options.servername = host;
    const req = mod.request(options, (res) => {
      const chunks = [];
      let size = 0;
      res.on("data", (c) => {
        size += c.length;
        if (size > maxBytes) { done(rejectP, new FetchRefused("too-large")); req.destroy(); return; }
        chunks.push(c);
      });
      res.on("end", () => {
        let buf = Buffer.concat(chunks);
        try { if (/gzip/i.test(res.headers["content-encoding"] ?? "")) buf = zlib.gunzipSync(buf, { maxOutputLength: maxBytes }); } catch { return done(rejectP, new FetchRefused("too-large")); }
        done(resolveP, { status: res.statusCode, headers: res.headers, body: buf.toString("utf8"), bytes: buf.length, address });
      });
      res.on("error", (e) => done(rejectP, new FetchRefused("network", e.code)));
    });
    const timer = setTimeout(() => { done(rejectP, new FetchRefused("timeout")); req.destroy(); }, timeoutMs);
    req.on("error", (e) => done(rejectP, e instanceof FetchRefused ? e : new FetchRefused("network", e.code)));
    req.end();
  });
}

/**
 * Guarded fetcher: host allowlist, forbidden hosts (abort the run), all
 * A/AAAA vetted per hop, manual redirects within the allowlist (max 5),
 * byte and time caps. `resolver` and `request` are injectable for tests;
 * `allowLoopbackForTests` permits 127.0.0.0/8 and ::1 only.
 */
export function createFetcher({ allowHosts, forbiddenHosts = new Set(), resolver = defaultResolver, request = nodeRequest, allowLoopbackForTests = false, maxBytes = LIMITS.maxBytes, timeoutMs = LIMITS.timeoutMs, maxHops = LIMITS.maxHops }) {
  async function vet(host, deadline) {
    if (forbiddenHosts.has(host)) throw new GateAbort("production-host-request");
    if (!allowHosts.has(host)) throw new FetchRefused("host-not-allowlisted");
    const bare = host.replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
    const addrs = net.isIP(bare) ? [{ address: bare, family: net.isIP(bare) }] : await withDeadline(Promise.resolve().then(() => resolver(bare, { timeoutMs: Math.max(1, deadline - Date.now()) })), deadline);
    if (!addrs.length) throw new FetchRefused("dns-unresolved");
    if (addrs.some((a) => isUnsafeAddress(a.address, { allowLoopback: allowLoopbackForTests }))) throw new FetchRefused("unsafe-address");
    return { ...addrs[0], bare };
  }
  /** One absolute deadline (r1 #3) covers DNS, every redirect hop and the body. */
  async function get(url, { follow = true, allowHttp = false } = {}) {
    if (allowHttp && follow) throw new FetchRefused("http-only-without-redirects");
    let u = new URL(url);
    const deadline = Date.now() + timeoutMs;
    for (let hop = 0; ; hop++) {
      if (u.protocol !== "https:" && !(allowHttp && u.protocol === "http:")) throw new FetchRefused("scheme-not-allowed");
      if (u.username || u.password) throw new FetchRefused("credentials-in-url");
      const a = await vet(u.host.toLowerCase(), deadline);
      const left = deadline - Date.now();
      if (left <= 0) throw new FetchRefused("timeout");
      const res = await withDeadline(Promise.resolve().then(() => request({ url: u.href, host: a.bare, address: a.address, family: a.family, maxBytes, timeoutMs: left })), deadline);
      const loc = res.headers?.location;
      if (follow && [301, 302, 303, 307, 308].includes(res.status) && loc) {
        if (hop + 1 > maxHops) throw new FetchRefused("too-many-redirects");
        u = new URL(loc, u);
        continue;
      }
      return { ...res, url: u.href, hops: hop };
    }
  }
  return { get };
}

/** Classify a blocked response: `waf`, `origin`, or null when the response is a measurement. */
export function classifyBlocked(res) {
  const h = res.headers ?? {};
  const body = String(res.body ?? ""); // the whole capped body (r1 #8)
  const wafHeader = h["cf-mitigated"] || h["x-vercel-mitigated"] || h["x-amzn-waf-action"] || h["x-sucuri-id"] || h["x-datadome"] || h["x-akamai-transformed"];
  const challenge = /cf-chl[-_]|\/cdn-cgi\/challenge-platform\/|<title>\s*Just a moment\.\.\.\s*<\/title>|Attention Required! \| Cloudflare|\/_vercel\/challenge|vercel-challenge-|captcha-delivery\.com|<title>\s*Access Denied\s*<\/title>[\s\S]{0,2000}Reference #/i.test(body);
  const edgeServer = /cloudflare|akamai|sucuri|imperva/i.test(String(h.server ?? ""));
  if (res.status === 429) return wafHeader || challenge || edgeServer ? "waf" : "origin";
  if (wafHeader && (res.status === 403 || res.status === 503 || challenge)) return "waf";
  if (challenge && (res.status === 403 || res.status === 503 || res.status === 200)) return "waf";
  if (res.status === 502 || res.status === 503 || res.status === 504) return "origin";
  return null;
}

// ---------------------------------------------------------------- live mode

async function pool(items, n, fn) {
  let next = 0;
  const workers = Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) { const k = next++; await fn(items[k], k); }
  });
  await Promise.all(workers);
}

export function applySample(paths, rule) {
  const m = /^(every|first):(\d+)$/.exec(String(rule));
  if (!m || Number(m[2]) < 1) throw new ConfigError("sample", "rule-must-be-every:N-or-first:N");
  const n = Number(m[2]);
  return m[1] === "first" ? paths.slice(0, n) : paths.filter((_, k) => k % n === 0);
}

/**
 * Live mode. `origin` is the asserted production origin; `opts.transport`
 * (with `opts.receipt`) sends every request to a preview deployment instead.
 */
export async function runLive(origin, cfg, opts = {}) {
  const { level = "L0", now = new Date(), transport = null, receipt = null, expectedSha = null, sample = null, resolver, request, allowLoopbackForTests = false, retryDelayMs = 1500, configDir = process.cwd() } = opts;
  let prod;
  try { prod = new URL(origin); } catch { throw new ConfigError("origin", "invalid"); }
  if (prod.origin !== new URL(cfg.canonical_origin).origin) throw new ConfigError("origin", "differs-from-canonical_origin");
  const r = newReport(cfg, level, "live", now);
  const ctx = makeCtx(cfg, prod.origin);
  if (cfg.route_manifest) ctx.routeManifest = JSON.parse(readFileSync(resolve(configDir, cfg.route_manifest), "utf8"));
  checkExceptionExpiry(r);

  const twin = cfg.twin_host === null ? null : cfg.twin_host ?? (prod.hostname.startsWith("www.") ? prod.hostname.slice(4) : prod.hostname.split(".").length === 2 ? `www.${prod.hostname}` : null);
  let base = prod.origin;
  const forbidden = new Set();
  let allow;
  if (transport) {
    let t;
    try { t = new URL(transport); } catch { throw new ConfigError("transport", "invalid"); }
    if (t.origin === prod.origin) throw new ConfigError("transport", "equals-production");
    readReceipt(receipt, transport, cfg, expectedSha);
    base = t.origin;
    forbidden.add(prod.host);
    if (twin) forbidden.add(twin);
    allow = new Set([t.host]); // r2 #1: the transport host only, never asset hosts
    r.notes.push("preview-mode L0-09=skipped-production-only x-robots-tag=ignored-platform-header");
    ctx.ignoreXRobotsTag = true;
  } else {
    allow = new Set([prod.host, ...(cfg.asset_hosts ?? [])]);
    if (twin) allow.add(twin);
  }
  ctx.allowHosts = new Set([prod.host, ...(cfg.asset_hosts ?? [])]);
  const fetcher = createFetcher({ allowHosts: allow, forbiddenHosts: forbidden, resolver, request, allowLoopbackForTests });
  const toTransport = (url) => {
    const u = new URL(url);
    // String join, never resolution against base: a `//host/...` path must not become protocol-relative (r3 #1).
    return transport && u.host === prod.host ? `${base}${u.pathname}${u.search}` : u.href;
  };
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  // Fetch with one retry; returns {res} | {unmeasured} | {refused}.
  async function measure(url, path, follow, { judge5xx = false, allowHttp = false } = {}) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetcher.get(toTransport(url), { follow, allowHttp });
        const cls = classifyBlocked(res);
        if (!cls || (judge5xx && cls === "origin" && res.status >= 500)) return { res };
        if (attempt === 1) { r.unmeasured.push({ path, cls, reason: `status=${res.status}` }); return { unmeasured: cls }; }
      } catch (e) {
        if (e instanceof GateAbort) throw e;
        const reason = e instanceof FetchRefused ? e.reason : "network";
        if (["unsafe-address", "host-not-allowlisted", "scheme-not-allowed", "credentials-in-url", "too-many-redirects"].includes(reason)) { r.refused.push({ path, reason }); return { refused: reason }; }
        if (reason === "too-large") return { tooLarge: true };
        if (attempt === 1) { r.unmeasured.push({ path, cls: "origin", reason }); return { unmeasured: "origin" }; }
      }
      if (retryDelayMs) await sleep(retryDelayMs);
    }
    return {};
  }

  try {
    const robots = await measure(`${prod.origin}/robots.txt`, "/robots.txt", true, { judge5xx: true });
    if (robots.res) evaluateRobots(r, ctx, { status: robots.res.status, body: robots.res.body });

    // Sitemaps: declared on the production host, else /sitemap.xml.
    const declared = (ctx.robots?.sitemaps ?? []).filter((s) => { try { return new URL(s).host === prod.host; } catch { return false; } });
    const roots = declared.length ? [...new Set(declared)] : [`${prod.origin}/sitemap.xml`];
    const sitemap = { found: false, ok: false, locs: [], alternates: new Map(), sampleRule: sample };
    const bodies = new Map();
    const loadUrl = async (loc) => {
      const path = new URL(loc).pathname;
      const m = await measure(loc, path, true);
      if (!m.res) return m.unmeasured || m.refused ? undefined : null;
      return m.res.status === 200 ? m.res.body : null;
    };
    for (const root of roots) {
      const body = await loadUrl(root);
      if (body === undefined) continue;
      if (body === null) continue;
      sitemap.found = true;
      // Prefetch children of an index so collectSitemap stays synchronous.
      const parsed = parseSitemap(body);
      if (parsed.ok && parsed.kind === "sitemapindex") {
        const chosen = chooseChildren({ ...sitemap }, parsed.entries).filter((e) => { try { return new URL(e.loc).host === prod.host; } catch { return false; } });
        await pool(chosen, LIMITS.concurrency, async (e) => { if (!bodies.has(e.loc)) bodies.set(e.loc, await loadUrl(e.loc)); });
      }
      collectSitemap(sitemap, body, ctx, (loc) => bodies.get(loc) ?? null, 0);
    }
    const sitemapMeasured = sitemap.found || !r.unmeasured.concat(r.refused).some((x) => /sitemap/.test(x.path));
    if (!sitemapMeasured) sitemap.unmeasured = true;

    // Pages.
    const paths = [];
    const seen = new Set();
    for (const loc of sitemap.locs) {
      try { const u = new URL(loc); if (u.host === prod.host && u.protocol === "https:" && !seen.has(u.pathname + u.search)) { seen.add(u.pathname + u.search); paths.push(u.pathname + u.search); } } catch { /* flagged in evaluateSite */ }
    }
    let targets = paths;
    // One sampling level: over the child list when the index was sampled, else over pages.
    if (sample) {
      if (!sitemap.childrenSampled) targets = applySample(paths, sample);
      r.sample = { rule: sample, tested: targets.length, total: paths.length };
    }
    const pages = new Map();
    await pool(targets, LIMITS.concurrency, async (path) => {
      const m = await measure(`${prod.origin}${path}`, path, false);
      if (m.tooLarge) { r.tooLarge = (r.tooLarge ?? 0) + 1; fail(r, "L0-11", path, `html-too-large bytes>${LIMITS.maxBytes}`); return; }
      if (!m.res) return;
      const lower = Object.fromEntries(Object.entries(m.res.headers ?? {}).map(([k, v]) => [k.toLowerCase(), Array.isArray(v) ? v.join(", ") : String(v)]));
      if (m.res.status === 200) {
        // r1 #8: a sitemap URL must serve HTML; anything else is a finding, not a page.
        const ct = (lower["content-type"] ?? "").split(";")[0].trim().toLowerCase();
        if (ct !== "text/html") {
          fail(r, "L0-07", path, `sitemap-url-not-html content_type=${!ct ? "absent" : /^[a-z0-9.+-]{1,40}\/[a-z0-9.+-]{1,60}$/.test(ct) ? ct : "other"}`);
          r.nonHtml = (r.nonHtml ?? 0) + 1;
          return;
        }
      }
      pages.set(path, { path, status: m.res.status, bytes: m.res.bytes ?? Buffer.byteLength(m.res.body ?? ""), html: m.res.status === 200 ? m.res.body ?? "" : "", headers: lower });
    });
    for (const page of [...pages.values()].sort((a, b) => a.path.localeCompare(b.path))) evaluatePage(r, ctx, page);
    if (sitemap.unmeasured) { r.coverage = `mode=live level=${level} sitemap=not-measured`; }
    else evaluateSite(r, ctx, pages, sitemap);
    if (sample) r.coverage += ` sample=${sample}`;
    if (atLeast(level, "L0Q")) {
      evaluateQuarterly(r, pages);
      // Our host only, https only; a Location elsewhere ends the chain.
      await probeRedirectChains(r, pages, async (path) => {
        const res = await fetcher.get(toTransport(`${prod.origin}${path}`), { follow: false });
        const next = (loc) => {
          let u;
          try { u = new URL(loc, `${prod.origin}${path}`); } catch { return null; }
          const ours = u.host === prod.host || (transport && u.host === new URL(base).host);
          return u.protocol === "https:" && ours ? `${u.pathname}${u.search}` : null;
        };
        return { ...res, next };
      }, { budgetMs: opts.redirectChainBudgetMs ?? LIMITS.redirectChainBudgetMs });
    }

    // L0-09 redirect probes, production only.
    if (!transport) await probeRedirects(r, prod, twin, paths, measure, ctx);

    const llms = await measure(`${prod.origin}/llms.txt`, "/llms.txt", true);
    if (llms.res && llms.res.status !== 200) warn(r, "R1c", "/llms.txt", `llms-txt-status status=${llms.res.status}`);
    r.pages = pages;
  } catch (e) {
    if (e instanceof GateAbort) { r.aborted = e.reason; return r; }
    throw e;
  }
  return r;
}

async function probeRedirects(r, prod, twin, paths, measure, ctx) {
  const home = `${prod.origin}/`;
  const expectOneHop = async (kind, url, want, allowHttp = false) => {
    const m = await measure(url, new URL(url).pathname, false, { allowHttp });
    if (!m.res) return;
    const loc = m.res.headers?.location;
    if (m.res.status !== 301 && m.res.status !== 308) { fail(r, "L0-09", new URL(url).pathname, `${kind} status=${m.res.status}`); return; }
    if (!loc || normUrl(new URL(loc, url).href) !== normUrl(want)) fail(r, "L0-09", new URL(url).pathname, `${kind} target-not-canonical hash=${hash(loc ?? "")}`);
  };
  await expectOneHop("http-to-https", `http://${prod.host}/`, home, true);
  if (twin) {
    const m = await measure(`https://${twin}/`, "/", false).catch(() => null);
    if (m?.res) {
      const loc = m.res.headers?.location;
      if ((m.res.status !== 301 && m.res.status !== 308) || !loc || normUrl(new URL(loc, `https://${twin}/`).href) !== normUrl(home)) fail(r, "L0-09", "/", `twin-redirect status=${m.res.status}`);
    }
  }
  const sampleP = paths.find((p) => p !== "/" && !p.includes("?"));
  if (sampleP) {
    const variant = sampleP.endsWith("/") ? sampleP.slice(0, -1) : `${sampleP}/`;
    const m = await measure(`${prod.origin}${variant}`, variant, false);
    if (m.res) {
      const loc = m.res.headers?.location;
      if (![301, 308].includes(m.res.status) || !loc || normUrl(new URL(loc, `${prod.origin}${variant}`).href) !== normUrl(ctx.expectedUrl(sampleP))) fail(r, "L0-09", variant, `trailing-slash-variant status=${m.res.status}`);
    }
  }
  // The probe takes the site's own slash form, so a trailing-slash site is not failed for the
  // 308 it owes the bare form (live false fail on grcskills, 2026-10-19).
  const unknown = `/seo-gate-probe-${randomBytes(6).toString("hex")}${r.cfg?.trailing_slash === "always" ? "/" : ""}`;
  const m = await measure(`${prod.origin}${unknown}`, "/seo-gate-probe", false);
  if (m.res && m.res.status !== 404) fail(r, "L0-09", "/seo-gate-probe", `unknown-path status=${m.res.status}`);
}

// ---------------------------------------------------------------- snapshot

const robotsEnum = (p) => {
  const all = [...(p.f?.robots ?? []), String(p.headers?.["x-robots-tag"] ?? "").toLowerCase()].join(",");
  const ni = /noindex|\bnone\b/.test(all);
  const nf = /nofollow|\bnone\b/.test(all);
  if (ni && nf) return "noindex-nofollow";
  if (ni) return "noindex";
  if (nf) return "nofollow";
  return all.replace(/,/g, "").trim() ? "index" : "absent";
};

/** One JSONL row per measured URL: booleans, enums, lengths and hashes only. */
export function snapshotRows(r, ctx = { allowHosts: new Set([new URL(r.cfg.canonical_origin).host, ...(r.cfg.asset_hosts ?? [])]) }) {
  const rows = [];
  for (const p of [...(r.pages?.values() ?? [])].sort((a, b) => a.path.localeCompare(b.path))) {
    const f = p.f ?? { titles: [], descriptions: [], canonicals: [], h1: [], og: {} };
    const row = ticketPath(p.path) ? { path: p.path } : { path_hash: hash(p.path) };
    const title = f.titles[0];
    const desc = f.descriptions[0];
    const canon = f.canonicals[0];
    const img = f.og?.["og:image"];
    let imgOk = null;
    if (img) { try { const u = new URL(img); imgOk = u.protocol === "https:" && ctx.allowHosts.has(u.host); } catch { imgOk = false; } }
    const schema = {};
    for (const t of p.jsonld?.nodes.flatMap((n) => n.types) ?? []) { const k = SCHEMA_ALLOWLIST.has(t) ? t : "other"; schema[k] = (schema[k] ?? 0) + 1; }
    Object.assign(row, {
      status: p.status,
      title_len: title?.length ?? null, title_hash: title ? hash(title) : null,
      description_len: desc?.length ?? null, description_hash: desc ? hash(desc) : null,
      canonical_self: canon ? normUrl(canon) === normUrl(p.expected) : false, canonical_hash: canon ? hash(canon) : null,
      robots_enum: robotsEnum(p),
      h1_hash: f.h1?.[0] ? hash(f.h1[0]) : null,
      og_image_host_ok: imgOk, og_image_hash: img ? hash(img) : null,
      schema_types: schema,
    });
    rows.push(row);
  }
  return rows;
}

// ---------------------------------------------------------------- digest (A6, I16)

/** sha256 of the file body, excluding line 1 (the version header). */
export function bodyDigest(text) {
  const nl = text.indexOf("\n");
  return createHash("sha256").update(nl === -1 ? "" : text.slice(nl + 1)).digest("hex");
}

/** Compare a (vendored) gate file against a VERSION file's pinned digest and version. */
export function checkVendored(fileText, versionText) {
  const header = /^\/\/ seo-gate v(\d+\.\d+\.\d+) canonical: /.exec(fileText);
  const version = /^version:\s*(\S+)\s*$/m.exec(versionText)?.[1];
  const pinned = /^body_sha256:\s*([0-9a-f]{64})\s*$/m.exec(versionText)?.[1];
  const actual = bodyDigest(fileText);
  const problems = [];
  if (!header) problems.push("header-missing");
  else if (header[1] !== version) problems.push("version-mismatch");
  if (!pinned || pinned !== actual) problems.push("digest-mismatch");
  return { ok: problems.length === 0, problems, version: header?.[1] ?? null, pinned: pinned ?? null, actual };
}

// ---------------------------------------------------------------- CLI

function parseArgs(argv) {
  const pos = [];
  const flags = {};
  for (let k = 0; k < argv.length; k++) {
    const a = argv[k];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const v = argv[k + 1];
      if (v === undefined || v.startsWith("--")) throw new ConfigError(`--${key}`, "value-missing");
      flags[key] = v;
      k++;
    } else pos.push(a);
  }
  return { pos, flags };
}

/** CLI entry. Returns {lines, code}; the caller prints and exits. */
export async function main(argv, io = {}) {
  const now = io.now ?? new Date();
  try {
    const { pos, flags } = parseArgs(argv);
    const [mode, target] = pos;
    if (mode === "digest") {
      if (!target) throw new ConfigError("digest", "file-missing");
      const text = readFileSync(target, "utf8");
      const header = /^\/\/ seo-gate v(\d+\.\d+\.\d+) /.exec(text)?.[1] ?? "unknown";
      const lines = [`version: ${header}`, `body_sha256: ${bodyDigest(text)}`];
      if (!flags["version-file"]) return { lines, code: 0 };
      const res = checkVendored(text, readFileSync(flags["version-file"], "utf8"));
      return { lines: [...lines, res.ok ? "digest-ok" : `digest-fail ${res.problems.join(",")}`], code: res.ok ? 0 : 1 };
    }
    if (!["build", "live", "snapshot"].includes(mode)) throw new ConfigError("mode", "must-be-build-live-snapshot-or-digest");
    if (!flags.config) throw new ConfigError("--config", "required");
    const level = flags.level ?? "L0";
    if (!LEVELS.includes(level)) throw new ConfigError("--level", "must-be-L0-L0P-or-L0Q");
    let cfg;
    try { cfg = JSON.parse(readFileSync(flags.config, "utf8")); } catch { throw new ConfigError("--config", "unreadable-json"); }
    validateConfig(cfg, { now });
    const configDir = dirname(resolve(flags.config));
    let r;
    if (mode === "build") {
      const dir = target ? resolve(target) : cfg.output_dir ? resolve(configDir, cfg.output_dir) : null;
      if (!dir) throw new ConfigError("build-dir", "missing");
      r = runBuild(dir, cfg, { level, now, configDir });
    } else {
      if (!target) throw new ConfigError("origin", "missing");
      if (flags.transport && !flags["expected-sha"]) throw new ConfigError("--expected-sha", "required-with-transport");
      if (flags.transport && !flags["deployment-receipt"]) throw new ConfigError("--deployment-receipt", "required-with-transport");
      let receipt = null;
      if (flags["deployment-receipt"]) {
        try { receipt = JSON.parse(readFileSync(flags["deployment-receipt"], "utf8")); } catch { throw new ConfigError("--deployment-receipt", "unreadable-json"); }
      }
      if (flags.sample) applySample([], flags.sample);
      r = await runLive(target, cfg, { level, now, transport: flags.transport ?? null, receipt, expectedSha: flags["expected-sha"] ?? null, sample: flags.sample ?? null, configDir, ...io.live });
      if (mode === "snapshot") {
        const jsonl = snapshotRows(r).map((x) => JSON.stringify(x)).join("\n") + "\n";
        if (flags.out) writeFileSync(flags.out, jsonl);
        const out = formatReport(r);
        return { lines: out.lines, code: out.code, stdout: flags.out ? null : jsonl };
      }
    }
    return formatReport(r);
  } catch (e) {
    if (e instanceof ConfigError) return { lines: [`config-error ${e.field} ${e.reason}`], code: 2 };
    if (e instanceof SyntaxError) return { lines: ["config-error input unparseable-json"], code: 2 };
    return { lines: [`config-error input ${e.code ?? "unexpected"}`], code: 2 };
  }
}

const isMain = (() => { try { return process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url); } catch { return false; } })();
if (isMain) {
  const out = await main(process.argv.slice(2));
  if (out.stdout) { process.stdout.write(out.stdout); for (const l of out.lines) process.stderr.write(`${l}\n`); }
  else for (const l of out.lines) process.stdout.write(`${l}\n`);
  process.exitCode = out.code;
}
