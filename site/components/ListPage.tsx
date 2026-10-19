import Breadcrumbs, { type Crumb } from './Breadcrumbs';
import JsonLd from './JsonLd';
import Row from './Row';
import { SITE_URL, toRow, type Skill } from '@/lib/content';

export default function ListPage({ title, lead, crumbs, list, path }: { title: string; lead: React.ReactNode; crumbs: Crumb[]; list: Skill[]; path: string }) {
  return (
    <div className="page">
      <Breadcrumbs items={crumbs} />
      <header className="page-head">
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
      </header>
      {list.length ? (
        <ul className="rows">{list.map((s) => <Row key={s.slug} r={toRow(s)} />)}</ul>
      ) : (
        <p className="empty">No skills here yet.</p>
      )}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${title} | grcskills`,
          url: `${SITE_URL}${path}`,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: list.length,
            itemListElement: list.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/skill/${s.slug}/`, name: s.title })),
          },
        }}
      />
    </div>
  );
}
