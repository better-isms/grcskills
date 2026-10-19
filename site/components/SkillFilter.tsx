'use client';

import { useState } from 'react';
import Row from './Row';
import type { RowData } from '@/lib/content';

type Opt = { value: string; label: string; count: number };

function Pills({ name, options, value, onChange }: { name: string; options: Opt[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset className="pills">
      <legend>{name}</legend>
      <button type="button" className="pill" aria-pressed={value === ''} onClick={() => onChange('')}>All</button>
      {options.map((o) => (
        <button key={o.value} type="button" className="pill" aria-pressed={value === o.value} onClick={() => onChange(value === o.value ? '' : o.value)}>
          {o.label} <span className="pill-n">{o.count}</span>
        </button>
      ))}
    </fieldset>
  );
}

export default function SkillFilter({ rows, categories, frameworks }: { rows: RowData[]; categories: Opt[]; frameworks: Opt[] }) {
  const [cat, setCat] = useState('');
  const [fw, setFw] = useState('');
  const shown = rows.filter((r) => (!cat || r.category === cat) && (!fw || r.frameworks.includes(fw)));
  return (
    <>
      <div className="filters">
        <Pills name="Category" options={categories} value={cat} onChange={setCat} />
        <Pills name="Framework" options={frameworks} value={fw} onChange={setFw} />
      </div>
      <p className="search-status" aria-live="polite">{shown.length} of {rows.length} skills</p>
      {shown.length ? (
        <ul className="rows">{shown.map((r) => <Row key={r.slug} r={r} />)}</ul>
      ) : (
        <p className="empty">No skill has both filters yet. Clear one to see more.</p>
      )}
    </>
  );
}
