import type { Metadata, Viewport } from 'next';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import { COPILOT_FOOTER_URL, meta, SITE_URL } from '@/lib/content';
import './globals.css';

// next/font downloads the files at build time and serves them from this
// origin, so the CSP can keep font-src 'self'.
const sans = Inter_Tight({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-mono', display: 'swap' });

// Cookieless Vercel Web Analytics, off unless the build sets the flag.
const ANALYTICS = process.env.NEXT_PUBLIC_GRCSKILLS_ANALYTICS === '1';

const DESCRIPTION = `Open GRC skills for AI agents. Paste the prompt into your agent; it runs ${meta.count} practitioner skills against your files and writes a 30-day plan.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Open GRC skills for AI agents | grcskills', template: '%s | grcskills' },
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'grcskills',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'grcskills: one prompt, your setup reviewed' }],
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.svg' },
  other: { 'grcskills-build': meta.sha, 'grcskills-tag': meta.tag },
};

export const viewport: Viewport = { themeColor: '#eef1f5', colorScheme: 'light' };

const NAV = [
  { href: '/skills/', label: 'Skills' },
  { href: '/#categories', label: 'Categories' },
  { href: '/contribute/', label: 'Contribute' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
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
