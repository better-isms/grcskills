'use client';

import { useEffect, useRef, useState } from 'react';

function fallbackCopy(text: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } finally { ta.remove(); }
}

export default function CopyButton({ text, label, className = 'b1' }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      fallbackCopy(text);
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button type="button" className={className} onClick={onClick} aria-live="polite">
      {copied ? 'Copied' : label}
    </button>
  );
}
