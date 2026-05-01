'use client';

import Link from 'next/link';
import { TierBadge } from '@/components/shared/TierBadge';
import { PpaChip } from '@/components/shared/PpaChip';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import type { Signal } from '@/lib/types';

interface QuickPeekProps {
  signal: Signal | null;
}

export function QuickPeek({ signal }: QuickPeekProps) {
  return (
    <aside
      className="w-80 shrink-0 border-l border-[var(--border)] bg-[var(--surface)] overflow-y-auto"
      aria-label="Signal quick peek"
    >
      {!signal ? (
        <div className="h-full flex items-center justify-center px-6">
          <p className="text-center text-[var(--ink-tertiary)] text-sm leading-relaxed">
            Hover a signal to preview it here.
          </p>
        </div>
      ) : (
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-[var(--ink-tertiary)]">{signal.id}</span>
              <TierBadge tier={signal.tier} size="sm" />
            </div>
            <h3 className="font-display text-sm font-semibold text-[var(--ink)] leading-snug">
              {signal.title}
            </h3>
          </div>

          {/* PPA chips */}
          <div className="flex flex-wrap gap-1">
            {signal.ppa.map((p) => (
              <PpaChip key={p} pillar={p} />
            ))}
          </div>

          {/* Summary */}
          <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
            {signal.summary}
          </p>

          {/* Recommended action */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-tertiary)] mb-1">
              Recommended Action
            </p>
            <p className="text-xs text-[var(--ink)] leading-relaxed">
              {signal.recommendedAction}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider">Confidence</span>
              <ConfidenceMeter value={signal.confidence} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider">Sources</span>
              <span className="font-mono text-[11px] text-[var(--ink-secondary)]">{signal.sources.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider">Triangulated</span>
              <span className="font-mono text-[11px] text-[var(--ink-secondary)]">{signal.triangulationCount}×</span>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2 border-t border-[var(--border)]">
            <Link
              href={`/signals/${signal.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--tier-watch)] text-white px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Open detail →
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
