import type { Metadata, Viewport } from 'next';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import { COPILOT_FOOTER_URL, HEYGRC_URL, meta, SITE_URL, TOPBAR } from '@/lib/content';
import { HOME_DESCRIPTION, HOME_TITLE, pageMeta } from '@/lib/seo';
import './globals.css';

// next/font downloads the files at build time and serves them from this
// origin, so the CSP can keep font-src 'self'.
const sans = Inter_Tight({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-mono', display: 'swap' });

// Cookieless Vercel Web Analytics, off unless the build sets the flag.
const ANALYTICS = process.env.NEXT_PUBLIC_GRCSKILLS_ANALYTICS === '1';

// Defaults for every page; each page sets its own title, description, canonical
// and image through pageMeta().
// No canonical or og:url here: a page that does not set its own must not
// inherit the home page's.
const base = pageMeta({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: '/', absoluteTitle: true, imageAlt: 'grcskills: one prompt, your setup reviewed' });
const { url: _url, ...openGraph } = (base.openGraph ?? {}) as Record<string, unknown>;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...base,
  openGraph,
  title: { default: HOME_TITLE, template: '%s | grcskills' },
  alternates: undefined,
  icons: { icon: [{ url: '/favicon.ico', sizes: '32x32' }, { url: '/favicon.svg', type: 'image/svg+xml' }] },
  other: { 'grcskills-build': meta.sha, 'grcskills-tag': meta.tag },
};

export const viewport: Viewport = { themeColor: '#eef1f5', colorScheme: 'light' };

const NAV = [
  { href: '/skills/', label: 'Skills' },
  { href: '/#categories', label: 'Categories' },
  { href: '/contribute/', label: 'Contribute' },
  { href: '/faq/', label: 'FAQ' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: public/topbar.js sets data-topbar on <html>
    // before React hydrates.
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Same-origin and parser-blocking on purpose: it must run before the
            bar renders so a dismissed bar never flashes (CSP script-src 'self'). */}
        <script src="/topbar.js" />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <div className="topbar" role="region" aria-label="Announcement">
          <p className="tb-msg">
            <span className="tb-long">{TOPBAR.long}</span>
            <span className="tb-short">{TOPBAR.short}</span>{' '}
            <a href={HEYGRC_URL}>{TOPBAR.link}<span aria-hidden="true"> &rarr;</span></a>
          </p>
          <button type="button" className="tb-x" data-topbar-dismiss="" aria-label={TOPBAR.dismiss}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <header className="nav">
          <Link className="wm" href="/">grcskills</Link>
          <nav className="links" aria-label="Main">
            {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
            <a href={meta.repoUrl}>GitHub</a>
          </nav>
          <details className="menu">
            <summary>Menu</summary>
            <nav aria-label="Main, small screens">
              {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
              <a href={meta.repoUrl}>GitHub</a>
            </nav>
          </details>
        </header>
        <main id="main" className="wrap">{children}</main>
        <footer className="ft">
          <div className="ft-row">
            <Link className="wm" href="/">grcskills</Link>
            <span>Open source, MIT licensed</span>
            <nav className="ft-links" aria-label="Footer">
              <Link href="/skills/">Skills</Link>
              <Link href="/contribute/">Contribute</Link>
              <Link href="/faq/">FAQ</Link>
              <a href={meta.repoUrl}>GitHub</a>
              <a href="/llms.txt">llms.txt</a>
            </nav>
            <a className="by" href={COPILOT_FOOTER_URL}>by ISMS Copilot</a>
          </div>
          <p className="ft-note">
            ISO, IEC, AICPA, SOC 2, PCI DSS, NIST and other framework names appear only as tags saying which framework a skill relates to; they belong to their owners. grcskills is not affiliated with, endorsed by or sponsored by any standards body or regulator, and the skills contain no text from the standards.
          </p>
        </footer>
        {ANALYTICS && <Analytics />}
      </body>
    </html>
  );
}
