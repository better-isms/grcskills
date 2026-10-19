import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ListPage from '@/components/ListPage';
import { frameworks, getFramework, skillsWithFramework } from '@/lib/content';

export const dynamicParams = false;
export const generateStaticParams = () => frameworks.filter((f) => f.count > 0).map((f) => ({ tag: f.tag }));

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = getFramework((await params).tag);
  if (!f) return {};
  return { title: `Skills tagged ${f.label}`, description: `${f.count} open GRC ${f.count === 1 ? 'skill' : 'skills'} for AI agents tagged ${f.label}.`, alternates: { canonical: `/framework/${f.tag}/` } };
}

export default async function FrameworkPage({ params }: Props) {
  const f = getFramework((await params).tag);
  if (!f || f.count === 0) notFound();
  const list = skillsWithFramework(f.tag);
  const lead = f.tag === 'general'
    ? `${list.length} ${list.length === 1 ? 'skill applies' : 'skills apply'} whatever the framework.`
    : `${list.length} ${list.length === 1 ? 'skill relates' : 'skills relate'} to ${f.label}. The tag says which framework a skill relates to; the skills contain no text from it.`;
  return (
    <ListPage
      title={`Skills tagged ${f.label}`}
      lead={lead}
      crumbs={[{ name: 'Skills', href: '/skills/' }, { name: f.label, href: `/framework/${f.tag}/` }]}
      list={list}
      path={`/framework/${f.tag}/`}
    />
  );
}
