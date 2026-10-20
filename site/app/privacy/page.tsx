import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { pageMeta } from '@/lib/seo';

// Text approved by the founder on 2026-10-20. Change it only with his approval.
export const metadata: Metadata = pageMeta({
  title: 'Privacy',
  description: 'How grcskills.com handles data: cookieless Vercel Web Analytics, hosting logs, no cookies.',
  path: '/privacy/',
});

export default function Privacy() {
  return (
    <div className="page">
      <Breadcrumbs items={[{ name: 'Privacy', href: '/privacy/' }]} />
      <header className="page-head">
        <h1>Privacy</h1>
      </header>
      <div className="prose">
        <p>grcskills.com is run by Better ISMS EURL.</p>
        <p><b>Page analytics.</b> We use Vercel Web Analytics, which does not use cookies and does not store IP addresses or personal identifiers; it records page views, referring sites and anonymised device categories. Lawful basis: our legitimate interest in knowing how the site is used. Retention: aggregated, not personal.</p>
        <p><b>Server logs.</b> Our hosting provider, Vercel, records requests (IP address, user agent, requested URL, time) for security and operations. Lawful basis: legitimate interest in keeping the site secure and available.</p>
        <p><b>Cookies.</b> This site sets no cookies and shows no cookie banner because none is needed.</p>
        <p>Your rights and contact: see the Better ISMS privacy policy at <a href="https://trust.ismscopilot.com/privacy-policy?ref=grcskills-privacy">https://trust.ismscopilot.com/privacy-policy</a>.</p>
      </div>
    </div>
  );
}
