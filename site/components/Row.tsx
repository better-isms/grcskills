import Link from 'next/link';
import type { RowData } from '@/lib/content';

export default function Row({ r }: { r: RowData }) {
  return (
    <li className="row">
      <Link className="row-link" href={`/skill/${r.slug}/`}>
        <span className="row-title">{r.title}</span>
        <span className="row-desc">{r.summary}</span>
        <span className="row-meta">
          <span>{r.categoryLabel}</span>
          <span>{r.frameworkLabels.join(', ')}</span>
          <span>{r.author}</span>
        </span>
      </Link>
    </li>
  );
}
