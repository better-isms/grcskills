import Breadcrumbs, { type Crumb } from './Breadcrumbs';
import JsonLd from './JsonLd';
import Row from './Row';
import { SITE_URL, toRow, type Skill } from '@/lib/content';

// `after` renders below the list (the heyGRC card on a few list pages).
export default function ListPage({ title, lead, intro, crumbs, list, path, listHeading, after }: { title: string; lead: React.ReactNode; intro?: string; crumbs: Crumb[]; list: Skill[]; path: string; listHeading?: string; after?: React.ReactNode }) {
  return (
    <div className="page">
      <Breadcrumbs items={crumbs} />
      <header className="page-head">
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
        {intro && <p className="intro">{intro}</p>}
      </header>
      {listHeading && <h2 className="list-h">{listHeading}</h2>}
      {list.length ? (
        <ul className="rows">{list.map((s) => <Row key={s.slug} r={toRow(s)} />)}</ul>
      ) : (
        <p className="empty">No skills here yet.</p>
      )}
      {after}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${title} | grcskills`,
          url: `${SITE_URL}${path}`,
          ...(intro ? { description: intro } : {}),
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
