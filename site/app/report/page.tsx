import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { meta } from '@/lib/content';
import { pageMeta } from '@/lib/seo';

// Notice-and-action mechanism (EU Digital Services Act Art. 16), point of
// contact for users (Art. 12) and copyright notices. Reports go to the privacy
// mailbox Better ISMS already publishes on its sites, or to a private GitHub
// security advisory for people who prefer GitHub.

const REPORT_EMAIL = 'privacy@ismscopilot.com';
const SUBJECT = 'Content report: grcskills';
const BODY = [
  'Exact URL of the content:',
  '',
  'Why the content is illegal or infringes your rights (for copyright: the work and the rights you hold):',
  '',
  'Your name:',
  'Your email:',
  '',
  'I confirm, in good faith, that the information and allegations in this notice are accurate and complete.',
  '',
].join('\n');
const MAILTO = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;

const FIELDS = [
  'The exact URL of the content (a skill page, an author page, or a file on GitHub).',
  'A clear explanation of why you believe the content is illegal or infringes your rights. For copyright, identify the work and the rights you hold.',
  'Your name and email address.',
  'A statement that you believe, in good faith, that the information and allegations in your notice are accurate and complete.',
];

export const metadata: Metadata = pageMeta({
  title: 'Report content',
  description: 'How to report illegal content or a copyright issue on grcskills, and how to contact us.',
  path: '/report/',
});

export default function Report() {
  return (
    <div className="page">
      <Breadcrumbs items={[{ name: 'Report content', href: '/report/' }]} />
      <header className="page-head">
        <h1>Report content</h1>
        <p className="lead">Report illegal content or a copyright issue in a skill or an author profile.</p>
      </header>

      <section className="section" aria-labelledby="what">
        <div className="bio">
          <h2 id="what">What you can report</h2>
          <p>Skills and author profiles are written by contributors. If you believe something here is illegal, or uses your copyright or other rights without permission, tell us. This page is our notice mechanism under the EU Digital Services Act (Article 16) and the way to send us a copyright notice.</p>

          <h2 id="include">What to include</h2>
          <ul>
            {FIELDS.map((f) => <li key={f}>{f}</li>)}
          </ul>

          <h2 id="send">How to send it</h2>
          <p>Email <a href={MAILTO}>{REPORT_EMAIL}</a>. The link opens a message with the fields above already laid out. If you prefer GitHub, you can send the same information privately through a <a href={`${meta.repoUrl}/security/advisories/new`}>private GitHub advisory</a>; please do not put personal details in a public issue.</p>
          <p>We review each notice, act on it (for example by correcting or removing the content and cutting a new release), and reply to you with our decision. We may also tell the contributor what we removed and why.</p>
        </div>
      </section>

      <section className="section close" aria-labelledby="contact">
        <div>
          <h2 id="contact">Point of contact</h2>
          <p>The same address is our single point of contact for users of grcskills (Digital Services Act, Article 12). You can write to us in English or French. For a question about a skill, see the <Link href="/faq/">FAQ</Link>.</p>
        </div>
        <a className="b2" href={MAILTO}>Report content by email</a>
      </section>
    </div>
  );
}
