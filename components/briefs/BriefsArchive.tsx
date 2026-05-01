'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Brief, Signal } from '@/lib/types';
import { BriefCarousel } from './BriefCarousel';
import { BriefReader } from './BriefReader';
import { BriefMiniTOC } from './BriefMiniTOC';

interface BriefsArchiveProps {
  briefs: Brief[];
  signals: Signal[];
}

function BriefsArchiveInner({ briefs, signals }: BriefsArchiveProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Default to most recent brief (briefs already sorted descending)
  const selectedId = searchParams.get('b') ?? briefs[0]?.id ?? '';
  const selectedBrief = briefs.find((b) => b.id === selectedId) ?? briefs[0];

  function selectBrief(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('b', id);
    router.push(`?${params.toString()}`);
  }

  if (!selectedBrief) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--ink-tertiary)] font-mono text-sm">No briefs available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Page header */}
      <div className="border-b border-[var(--border)] px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
        <h1 className="font-display text-2xl lg:text-3xl text-[var(--ink)]" style={{ fontVariationSettings: '"opsz" 96' }}>
          Quarterly Briefs Archive
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-secondary)]">
          Long-form intelligence briefs — executive summaries, thematic deep dives, and signal watchlists.
        </p>
      </div>

      {/* Carousel */}
      <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-6 border-b border-[var(--border)]">
        <BriefCarousel
          briefs={briefs}
          signals={signals}
          selectedId={selectedBrief.id}
          onSelect={selectBrief}
        />
      </div>

      {/* Reader + floating TOC */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* TOC rail — fixed right, only on wide screens */}
        <div className="hidden xl:block">
          <BriefMiniTOC />
        </div>

        {/* Long-form reader */}
        <BriefReader brief={selectedBrief} signals={signals} />
      </div>
    </div>
  );
}

export function BriefsArchive({ briefs, signals }: BriefsArchiveProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--ink-tertiary)] font-mono text-sm">Loading briefs…</p>
      </div>
    }>
      <BriefsArchiveInner briefs={briefs} signals={signals} />
    </Suspense>
  );
}
