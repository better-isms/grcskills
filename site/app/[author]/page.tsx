import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import Row from '@/components/Row';
import { authors, getAuthor, skillsByAuthor, toRow } from '@/lib/content';
import { personLd } from '@/lib/ld';
import { pageMeta } from '@/lib/seo';

export const dynamicParams = false;
export const generateStaticParams = () => authors.filter((a) => a.skills.length > 0).map((a) => ({ author: a.slug }));

type Props = { params: Promise<{ author: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = getAuthor((await params).author);
  if (!a) return {};
  return pageMeta({ title: a.name, description: `${a.name}, ${a.title}. Author of ${a.skills.length} GRC ${a.skills.length === 1 ? 'skill' : 'skills'} on grcskills.`, path: `/${a.slug}/`, type: 'profile' });
}

export default async function AuthorPage({ params }: Props) {
  const a = getAuthor((await params).author);
  if (!a) notFound();
  const list = skillsByAuthor(a.slug);
  return (
    <div className="page">
      <Breadcrumbs items={[{ name: a.name, href: `/${a.slug}/` }]} />
      <header className="author-head">
        <span className="av av-lg" aria-hidden="true">{a.initials}</span>
        <div>
          <h1>{a.name}</h1>
          <p className="lead" style={{ marginTop: 8 }}>{a.title}</p>
        </div>
      </header>
      <div className="bio" dangerouslySetInnerHTML={{ __html: a.bioHtml }} />
      <div className="meta-row">
        <a className="tag" href={a.linkedinUrl} rel="noopener noreferrer">LinkedIn</a>
        <a className="tag" href={`https://${a.companyDomain}`} rel="noopener noreferrer">{a.companyDomain}</a>
      </div>
      <section className="section" style={{ marginTop: 72 }} aria-labelledby="by">
        <h2 id="by">{list.length} {list.length === 1 ? 'skill' : 'skills'}</h2>
        <ul className="rows">{list.map((s) => <Row key={s.slug} r={toRow(s)} />)}</ul>
      </section>
      <JsonLd data={{ '@context': 'https://schema.org', ...personLd(a), worksFor: { '@type': 'Organization', url: `https://${a.companyDomain}` } }} />
    </div>
  );
}
