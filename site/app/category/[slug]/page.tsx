import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import HeygrcCard from '@/components/HeygrcCard';
import ListPage from '@/components/ListPage';
import { categories, getCategory, skillsInCategory, HEYGRC_LINE, HEYGRC_LIST_PATHS } from '@/lib/content';
import { firstSentence } from '@/lib/text';
import { pageMeta } from '@/lib/seo';

export const dynamicParams = false;
// Only categories with skills get a page; empty ones are not linked.
export const generateStaticParams = () => categories.filter((c) => c.count > 0).map((c) => ({ slug: c.slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory((await params).slug);
  if (!c) return {};
  return pageMeta({
    title: `${c.label} skills for AI agents`,
    description: firstSentence(c.intro),
    path: `/category/${c.slug}/`,
    image: `/og/category/${c.slug}.png`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const c = getCategory((await params).slug);
  if (!c || c.count === 0) notFound();
  const list = skillsInCategory(c.slug);
  return (
    <ListPage
      title={`${c.label} skills for AI agents`}
      lead={`${list.length} ${list.length === 1 ? 'skill' : 'skills'} in this category.`}
      intro={c.intro}
      listHeading={`The ${list.length} ${c.label.toLowerCase()} ${list.length === 1 ? 'skill' : 'skills'}`}
      crumbs={[{ name: 'Skills', href: '/skills/' }, { name: c.label, href: `/category/${c.slug}/` }]}
      list={list}
      path={`/category/${c.slug}/`}
      after={HEYGRC_LIST_PATHS.includes(`/category/${c.slug}/`) ? <HeygrcCard body={HEYGRC_LINE} className="list-card" /> : undefined}
    />
  );
}
