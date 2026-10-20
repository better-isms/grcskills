import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import HeygrcCard from '@/components/HeygrcCard';
import ListPage from '@/components/ListPage';
import { frameworks, getFramework, skillsWithFramework, HEYGRC_LINE, HEYGRC_LIST_PATHS } from '@/lib/content';
import { firstSentence } from '@/lib/text';
import { pageMeta } from '@/lib/seo';

export const dynamicParams = false;
export const generateStaticParams = () => frameworks.filter((f) => f.count > 0).map((f) => ({ tag: f.tag }));

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = getFramework((await params).tag);
  if (!f) return {};
  // Fewer than three skills is a thin page: noindex until it grows (it also
  // stays out of the sitemap).
  return pageMeta({
    title: `${f.label} agent skills`,
    description: firstSentence(f.intro),
    path: `/framework/${f.tag}/`,
    image: `/og/framework/${f.tag}.png`,
    noindex: !f.indexable,
  });
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
      title={`${f.label} agent skills`}
      lead={lead}
      intro={f.intro}
      listHeading={`${list.length} ${list.length === 1 ? 'skill' : 'skills'} tagged ${f.label}`}
      crumbs={[{ name: 'Skills', href: '/skills/' }, { name: f.label, href: `/framework/${f.tag}/` }]}
      list={list}
      path={`/framework/${f.tag}/`}
      after={HEYGRC_LIST_PATHS.includes(`/framework/${f.tag}/`) ? <HeygrcCard body={HEYGRC_LINE} className="list-card" /> : undefined}
    />
  );
}
