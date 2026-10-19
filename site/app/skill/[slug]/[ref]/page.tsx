import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getSkill, githubUrl, skills } from '@/lib/content';

export const dynamicParams = false;
// A static export needs at least one param set per dynamic segment; the
// placeholder renders a 404 page and is never linked or listed.
export const generateStaticParams = () => {
  const all = skills.flatMap((s) => s.references.map((r) => ({ slug: s.slug, ref: r.slug })));
  return all.length ? all : [{ slug: skills[0].slug, ref: '_none' }];
};

type Props = { params: Promise<{ slug: string; ref: string }> };

const find = async (params: Props['params']) => {
  const { slug, ref } = await params;
  const s = getSkill(slug);
  const r = s?.references.find((x) => x.slug === ref);
  return s && r ? { s, r } : null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await find(params);
  if (!f) return { title: 'Not found', robots: { index: false } };
  return {
    title: `${f.r.title} (${f.s.title})`,
    description: f.s.description,
    alternates: { canonical: `/skill/${f.s.slug}/${f.r.slug}/` },
  };
}

export default async function ReferencePage({ params }: Props) {
  const f = await find(params);
  if (!f) notFound();
  const { s, r } = f;
  return (
    <div className="page">
      <Breadcrumbs items={[{ name: 'Skills', href: '/skills/' }, { name: s.title, href: `/skill/${s.slug}/` }, { name: r.title, href: `/skill/${s.slug}/${r.slug}/` }]} />
      <header className="page-head">
        <h1>{r.title}</h1>
        <p className="lead">Reference for <Link href={`/skill/${s.slug}/`}>{s.title}</Link>.</p>
        <div className="meta-row"><a className="tag" href={githubUrl(r.repoPath)}>View on GitHub</a></div>
      </header>
      <article className="prose" dangerouslySetInnerHTML={{ __html: r.html }} />
    </div>
  );
}
