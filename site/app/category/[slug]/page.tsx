import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ListPage from '@/components/ListPage';
import { categories, getCategory, skillsInCategory } from '@/lib/content';

export const dynamicParams = false;
// Only categories with skills get a page; empty ones are not linked.
export const generateStaticParams = () => categories.filter((c) => c.count > 0).map((c) => ({ slug: c.slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory((await params).slug);
  if (!c) return {};
  return { title: c.label, description: `${c.count} open GRC ${c.count === 1 ? 'skill' : 'skills'} for AI agents: ${c.label.toLowerCase()}.`, alternates: { canonical: `/category/${c.slug}/` } };
}

export default async function CategoryPage({ params }: Props) {
  const c = getCategory((await params).slug);
  if (!c || c.count === 0) notFound();
  const list = skillsInCategory(c.slug);
  return (
    <ListPage
      title={c.label}
      lead={`${list.length} ${list.length === 1 ? 'skill' : 'skills'} in this category.`}
      crumbs={[{ name: 'Skills', href: '/skills/' }, { name: c.label, href: `/category/${c.slug}/` }]}
      list={list}
      path={`/category/${c.slug}/`}
    />
  );
}
