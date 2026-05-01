'use client';

import { useEffect, useRef, useState } from 'react';

interface TocEntry {
  id: string;
  label: string;
}

const TOC_ENTRIES: TocEntry[] = [
  { id: 'exec-summary', label: 'Executive Summary' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'thematic', label: 'Thematic Deep Dives' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'benchmarking', label: 'Benchmarking' },
  { id: 'signoff', label: 'Sign-off' },
];

export function BriefMiniTOC() {
  const [activeId, setActiveId] = useState<string>('exec-summary');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headingIds = TOC_ENTRIES.map((e) => e.id);

    // Track which sections are visible; the highest (earliest in DOM) visible one wins
    const visible = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }
        // Pick the first TOC entry that is currently visible
        const first = headingIds.find((id) => visible.has(id));
        if (first) setActiveId(first);
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    const observer = observerRef.current;
    for (const id of headingIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <nav
      aria-label="Article contents"
      className="fixed top-24 right-6 w-48 z-20 hidden xl:block"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-tertiary)] mb-3 px-2">
        Contents
      </p>
      <ul className="space-y-0.5">
        {TOC_ENTRIES.map((entry) => {
          const isActive = activeId === entry.id;
          return (
            <li key={entry.id}>
              <button
                onClick={() => scrollTo(entry.id)}
                className={[
                  'w-full text-left px-2 py-1.5 rounded-md text-sm transition-all duration-150',
                  isActive
                    ? 'text-[var(--ink)] font-medium bg-[var(--panel)] border-l-2 border-[var(--ink)]'
                    : 'text-[var(--ink-tertiary)] hover:text-[var(--ink-secondary)] hover:bg-[var(--panel)]/50',
                ].join(' ')}
                aria-current={isActive ? 'location' : undefined}
              >
                {entry.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
