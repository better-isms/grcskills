import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { meta, SITE_URL } from '@/lib/content';
import { faqGroups, faqLd } from '@/lib/faq';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: 'grcskills FAQ: cost, agents, data and safety',
  description: 'grcskills answers: who it is for, agents and frameworks, cost, client data and safety, stale evidence, updates, ISMS Copilot, publishing a skill.',
  path: '/faq/',
});

export default function Faq() {
  const groups = faqGroups(meta.tag, meta.count);
  return (
    <div className="page">
      <Breadcrumbs items={[{ name: 'FAQ', href: '/faq/' }]} />
      <header className="page-head">
        <h1>Questions people ask about grcskills</h1>
        <p className="lead">Many of these came from GRC people under the launch post. Ask yours on GitHub if it is not here.</p>
      </header>

      <nav className="faq-toc" aria-label="FAQ sections">
        <ul>
          {groups.map((g) => <li key={g.id}><a href={`#${g.id}`}>{g.title}</a></li>)}
        </ul>
      </nav>

      {groups.map((g) => (
        <section key={g.id} className="faq-group" aria-labelledby={g.id}>
          <h2 id={g.id}>{g.title}</h2>
          <div className="faq-list">
            {g.items.map((i) => (
              <article key={i.id} id={i.id} className="faq-item">
                <h3>{i.q}</h3>
                {i.a.map((p, k) => <p key={k}>{p}</p>)}
                {i.link && (
                  i.link.href.startsWith('/')
                    ? <p className="faq-link"><Link href={i.link.href}>{i.link.label}<span aria-hidden="true"> &rarr;</span></Link></p>
                    : <p className="faq-link"><a href={i.link.href}>{i.link.label}<span aria-hidden="true"> &rarr;</span></a></p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="section close" aria-labelledby="ask">
        <div>
          <h2 id="ask">Still have a question?</h2>
          <p>Open an issue on GitHub. If the answer helps others, it goes on this page.</p>
        </div>
        <a className="b2" href={`${meta.repoUrl}/issues`}>Ask on GitHub</a>
      </section>

      <JsonLd data={faqLd(groups, `${SITE_URL}/faq/`)} />
    </div>
  );
}
