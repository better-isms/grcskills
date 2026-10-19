import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import SkillFilter from '@/components/SkillFilter';
import { categories, frameworks, meta, SITE_URL, skills, toRow } from '@/lib/content';

export const metadata: Metadata = {
  title: 'All skills',
  description: `All ${meta.count} open GRC skills for AI agents, by category and framework.`,
  alternates: { canonical: '/skills/' },
};

export default function SkillsPage() {
  return (
    <div className="page">
      <Breadcrumbs items={[{ name: 'Skills', href: '/skills/' }]} />
      <header className="page-head">
        <h1>All skills</h1>
        <p className="lead">{meta.count} practitioner skills. Filter by the kind of work or by framework tag.</p>
      </header>
      <SkillFilter
        rows={skills.map(toRow)}
        categories={categories.filter((c) => c.count).map((c) => ({ value: c.slug, label: c.label, count: c.count }))}
        frameworks={frameworks.filter((f) => f.count).map((f) => ({ value: f.tag, label: f.label, count: f.count }))}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'All skills | grcskills',
          url: `${SITE_URL}/skills/`,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: skills.length,
            itemListElement: skills.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/skill/${s.slug}/`, name: s.title })),
          },
        }}
      />
    </div>
  );
}
