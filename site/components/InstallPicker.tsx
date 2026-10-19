'use client';

import { useId, useState } from 'react';
import CopyButton from './CopyButton';
import Cmd from './Cmd';

type Tab = { key: string; label: string; command: string; note: string };

export default function InstallPicker({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0].key);
  const base = useId();
  const onKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    setActive(next.key);
    document.getElementById(`${base}-tab-${next.key}`)?.focus();
  };
  return (
    <div className="picker">
      <div className="tabs" role="tablist" aria-label="Install with">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            id={`${base}-tab-${t.key}`}
            type="button"
            role="tab"
            className="tab"
            aria-selected={active === t.key}
            aria-controls={`${base}-panel-${t.key}`}
            tabIndex={active === t.key ? 0 : -1}
            onClick={() => setActive(t.key)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.key}
          id={`${base}-panel-${t.key}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${t.key}`}
          hidden={active !== t.key}
          className="panel"
        >
          <pre className="cmd"><code><Cmd text={t.command} /></code></pre>
          <div className="panel-row">
            <small>{t.note}</small>
            <CopyButton text={t.command} label="Copy" className="b2 b-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
