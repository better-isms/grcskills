// Images in the direction A style, rendered locally with no external service:
// satori lays out text with the bundled Inter Tight and JetBrains Mono fonts
// (glyphs become SVG paths), resvg turns the SVG into a PNG.
//
// Used at build time for the Open Graph cards (scripts/build-content.mjs) and,
// by hand, for the README banner, the social preview and the favicon
// (scripts/render-assets.mjs). Text drawn here is maintainer copy or
// schema-validated fields (title, category and framework labels).

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const require = createRequire(import.meta.url);
const fontFile = (pkg, file) => fs.readFileSync(path.join(path.dirname(require.resolve(`${pkg}/package.json`)), 'files', file));

let fonts;
function loadFonts() {
  fonts ??= [
    { name: 'Inter Tight', weight: 300, style: 'normal', data: fontFile('@fontsource/inter-tight', 'inter-tight-latin-300-normal.woff') },
    { name: 'Inter Tight', weight: 400, style: 'normal', data: fontFile('@fontsource/inter-tight', 'inter-tight-latin-400-normal.woff') },
    { name: 'Inter Tight', weight: 500, style: 'normal', data: fontFile('@fontsource/inter-tight', 'inter-tight-latin-500-normal.woff') },
    { name: 'JetBrains Mono', weight: 400, style: 'normal', data: fontFile('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff') },
  ];
  return fonts;
}

export const THEMES = {
  light: { bg: '#eef1f5', ink: '#0f172a', muted: '#64748b', card: '#ffffff', cardInk: '#0f172a', chip: '#e2e7ee', shadow: '0 30px 60px -40px rgba(15,23,42,.35)' },
  dark: { bg: '#0d1118', ink: '#e8edf5', muted: '#8b96a8', card: '#151b25', cardInk: '#e8edf5', chip: '#232b38', shadow: '0 30px 60px -40px rgba(0,0,0,.8)' },
};

// Minimal element builder for satori: h(style, ...children).
const h = (style, ...children) => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children },
});

export async function toSvg(element, width, height) {
  return satori(element, { width, height, fonts: loadFonts() });
}

export function toPng(svg, width) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false } }).render().asPng();
}

const wordmark = (t, size = 30) => h({ fontWeight: 500, fontSize: size, letterSpacing: '-0.03em', color: t.ink }, 'grcskills');

// Home, social preview and README banner: wordmark, H1, the stance line,
// prompt card (founder decision 2026-10-19: the agent does the legwork, the
// person makes the calls).
export function heroCard({ prompt, theme = 'light', width = 1200, height = 630, h1Size = 80, promptChars = 150 }) {
  const t = THEMES[theme];
  const pad = Math.round(width * 0.06);
  const short = prompt.length > promptChars ? `${prompt.slice(0, prompt.lastIndexOf(' ', promptChars))}...` : prompt;
  return h(
    { width, height, background: t.bg, color: t.ink, fontFamily: 'Inter Tight', flexDirection: 'column', padding: `${Math.round(pad * 0.8)}px ${pad}px`, justifyContent: 'space-between' },
    h({ justifyContent: 'space-between', alignItems: 'baseline' }, wordmark(t), h({ fontSize: 20, color: t.muted }, 'grcskills.com')),
    h(
      { flexDirection: 'column' },
      h({ fontWeight: 300, fontSize: h1Size, lineHeight: 1.0, letterSpacing: '-0.045em', maxWidth: Math.round(width * 0.86) }, 'Open GRC skills for AI agents.'),
      h({ fontSize: Math.round(h1Size * 0.36), color: t.muted, marginTop: Math.round(h1Size * 0.28), letterSpacing: '-0.01em' }, 'It does the legwork. You make the calls.'),
    ),
    h(
      { flexDirection: 'column', background: t.card, borderRadius: 28, padding: '28px 36px', boxShadow: t.shadow },
      h({ fontSize: 17, color: t.muted, marginBottom: 10 }, 'The prompt'),
      h({ fontFamily: 'JetBrains Mono', fontSize: 20, lineHeight: 1.6, color: t.cardInk }, short),
    ),
  );
}

// Build-time cards use a light shadow: a large blur costs resvg about half a
// second per image, which adds up over every skill page.
const FLAT_SHADOW = '0 1px 2px rgba(15,23,42,.08)';

const titleSize = (s) => (s.length <= 28 ? 84 : s.length <= 44 ? 72 : s.length <= 62 ? 60 : 50);

// One skill: category eyebrow, title, framework chips, install line.
export function skillCard({ title, category, frameworks, command }) {
  const t = THEMES.light;
  return h(
    { width: 1200, height: 630, background: t.bg, color: t.ink, fontFamily: 'Inter Tight', flexDirection: 'column', padding: '56px 72px 64px', justifyContent: 'space-between' },
    h({ justifyContent: 'space-between', alignItems: 'baseline' }, wordmark(t), h({ fontSize: 20, color: t.muted }, 'GRC agent skill')),
    h(
      { flexDirection: 'column' },
      h({ fontSize: 22, color: t.muted, marginBottom: 18 }, category),
      h({ fontWeight: 300, fontSize: titleSize(title), lineHeight: 1.04, letterSpacing: '-0.04em', maxWidth: 1000 }, title),
      h(
        { flexWrap: 'wrap', marginTop: 26 },
        ...frameworks.slice(0, 5).map((f) => h({ fontSize: 19, background: t.chip, borderRadius: 999, padding: '5px 16px', marginRight: 10, marginBottom: 8 }, f)),
      ),
    ),
    h(
      { background: t.card, borderRadius: 24, padding: '22px 30px', boxShadow: FLAT_SHADOW },
      h({ fontFamily: 'JetBrains Mono', fontSize: 19, color: t.cardInk }, command),
    ),
  );
}

// A category or framework page: kind eyebrow, heading, count line.
export function listCard({ kind, heading, line }) {
  const t = THEMES.light;
  return h(
    { width: 1200, height: 630, background: t.bg, color: t.ink, fontFamily: 'Inter Tight', flexDirection: 'column', padding: '56px 72px 64px', justifyContent: 'space-between' },
    h({ justifyContent: 'space-between', alignItems: 'baseline' }, wordmark(t), h({ fontSize: 20, color: t.muted }, 'Open GRC skills for AI agents')),
    h(
      { flexDirection: 'column' },
      h({ fontSize: 22, color: t.muted, marginBottom: 18 }, kind),
      h({ fontWeight: 300, fontSize: titleSize(heading), lineHeight: 1.04, letterSpacing: '-0.04em', maxWidth: 1000 }, heading),
    ),
    h({ background: t.card, borderRadius: 24, padding: '22px 30px', boxShadow: FLAT_SHADOW, fontSize: 22, color: t.cardInk }, line),
  );
}

// The favicon glyph: "gs" on a rounded ink square, as in favicon.svg.
export function glyph(size) {
  return h(
    { width: size, height: size, background: '#0f172a', borderRadius: size / 4, alignItems: 'center', justifyContent: 'center', color: '#eef1f5', fontFamily: 'Inter Tight', fontWeight: 500, fontSize: Math.round(size * 0.5), letterSpacing: '-0.05em', paddingBottom: Math.round(size * 0.06) },
    'gs',
  );
}

// An .ico holding PNG images (supported by every current browser).
export function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}
