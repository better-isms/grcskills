import Link from 'next/link';
import JsonLd from './JsonLd';
import { SITE_URL } from '@/lib/content';

export type Crumb = { name: string; href: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: 'Home', href: '/' }, ...items];
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol>
          {all.map((c, i) => (
            <li key={c.href}>
              {i < all.length - 1 ? <Link href={c.href}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: `${SITE_URL}${c.href}`,
          })),
        }}
      />
    </>
  );
}
