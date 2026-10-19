'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Row from './Row';
import type { RowData } from '@/lib/content';

// Static index written at build time: /search-index.json (same origin, so the
// CSP connect-src 'self' covers it). Loaded on first interaction.
// d is the summary shown in the row; k is the agent trigger text, searched but not shown.
type Entry = { s: string; t: string; d: string; k?: string; c: string; f: string[]; g: string[]; a: string };

const toRow = (e: Entry): RowData => ({
  slug: e.s, title: e.t, summary: e.d, category: '', categoryLabel: e.c, frameworks: [], frameworkLabels: e.f, author: e.a,
});

export default function SearchBox({ initial, total }: { initial: RowData[]; total: number }) {
  const [q, setQ] = useState('');
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const loading = useRef(false);

  const load = () => {
    if (index || loading.current) return;
    loading.current = true;
    fetch('/search-index.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: Entry[]) => setIndex(d))
      .catch(() => setFailed(true));
  };

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length || !index) return null;
    return index.filter((e) => {
      const hay = [e.t, e.d, e.k ?? '', e.c, e.a, ...e.f, ...e.g, e.s].join(' ').toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [q, index]);

  const shown = results ? results.map(toRow) : initial;

  return (
    <div className="search">
      <label className="search-label" htmlFor="skill-search">Search the skills</label>
      <input
        id="skill-search"
        className="search-input"
        type="search"
        placeholder="Risk register, vendor, nonconformity, GDPR"
        autoComplete="off"
        spellCheck={false}
        value={q}
        onFocus={load}
        onChange={(e) => { load(); setQ(e.target.value); }}
      />
      <p className="search-status" aria-live="polite">
        {failed
          ? 'Search is unavailable right now. Browse all skills instead.'
          : results
            ? `${results.length} of ${total} skills match`
            : `Showing ${initial.length} of ${total} skills`}
      </p>
      {shown.length > 0 ? (
        <ul className="rows">{shown.map((r) => <Row key={r.slug} r={r} />)}</ul>
      ) : (
        <p className="empty">No skill matches yet. Try a shorter word, or <Link href="/skills/">browse all skills</Link>.</p>
      )}
    </div>
  );
}
