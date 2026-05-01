'use client';

import Link from 'next/link';
import { ArrowLeft, Share2, Printer } from 'lucide-react';
import { TierBadge } from '@/components/shared/TierBadge';
import { PpaChip } from '@/components/shared/PpaChip';
import type { Signal } from '@/lib/types';
import { fmtDate } from '@/lib/format';

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export function StickyHeader({ signal }: { signal: Signal }) {
  const actionBy =
    signal.tier === 'action'
      ? fmtDate(addDays(signal.firstDetected, 3))
      : null;

  function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: signal.title, url: window.location.href }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  }

  function handlePrint() {
    if (typeof window !== 'undefined') window.print();
  }

  return (
    <div className="sticky top-14 lg:top-0 z-20 bg-[var(--surface)] border-b border-hair px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-start justify-between gap-4">
        {/* Left: back + meta */}
        <div className="flex flex-col gap-2 min-w-0">
          <Link
            href="/signals"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--ink-secondary)] hover:text-[var(--ink)] transition-colors uppercase tracking-wider"
          >
            <ArrowLeft size={12} />
            Signal Explorer
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-[var(--ink-tertiary)] uppercase tracking-widest">
              {signal.id}
            </span>
            <TierBadge tier={signal.tier} />
            {signal.ppa.map((p) => (
              <PpaChip key={p} pillar={p} />
            ))}
            {actionBy && (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-[var(--tier-action)] uppercase tracking-wider">
                <span className="size-1.5 rounded-full bg-[var(--tier-action)]" />
                Action by: {actionBy}
              </span>
            )}
          </div>

          <h1 className="font-display text-[clamp(22px,2.5vw,40px)] leading-tight text-[var(--ink)] max-w-[760px]">
            {signal.title}
          </h1>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-[var(--ink-secondary)] border border-hair rounded hover:bg-[var(--panel)] transition-colors"
          >
            <Share2 size={12} />
            Share
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-[var(--ink-secondary)] border border-hair rounded hover:bg-[var(--panel)] transition-colors"
          >
            <Printer size={12} />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
