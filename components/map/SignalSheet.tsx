'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, ArrowRight, BookOpen } from 'lucide-react';
import type { Signal } from '@/lib/types';
import { TierBadge } from '@/components/shared/TierBadge';
import { PpaChip } from '@/components/shared/PpaChip';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import { fmtDate } from '@/lib/format';

interface SignalSheetProps {
  signal: Signal | null;
  onClose: () => void;
}

export function SignalSheet({ signal, onClose }: SignalSheetProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!signal) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-20"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signal-sheet-title"
        className="absolute top-0 right-0 bottom-0 z-30 w-[420px] flex flex-col
                   bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl
                   animate-in slide-in-from-right-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
          <div className="flex flex-col gap-2 min-w-0 pr-3">
            <div className="flex items-center gap-2 flex-wrap">
              <TierBadge tier={signal.tier} />
              {signal.ppa.map((p) => <PpaChip key={p} pillar={p} />)}
            </div>
            <h2
              id="signal-sheet-title"
              className="font-display text-base font-semibold text-[var(--ink)] leading-snug"
            >
              {signal.title}
            </h2>
            <span className="font-mono text-[10px] text-[var(--ink-tertiary)]">{signal.id}</span>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 size-7 flex items-center justify-center rounded-md
                       text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--panel)]
                       transition-colors"
            aria-label="Close signal sheet"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Summary */}
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)] mb-1.5">
              Summary
            </h3>
            <p className="text-sm text-[var(--ink)] leading-relaxed">{signal.summary}</p>
          </div>

          {/* Recommended action */}
          <div className="rounded-lg border border-[var(--tier-action)]/30 bg-[var(--tier-action)]/5 px-4 py-3">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--tier-action)] mb-1.5">
              Recommended Action
            </h3>
            <p className="text-sm text-[var(--ink)] leading-relaxed">{signal.recommendedAction}</p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)] block mb-1">
                Confidence
              </span>
              <ConfidenceMeter value={signal.confidence} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)] block mb-1">
                Horizon
              </span>
              <span className="font-mono text-xs text-[var(--ink)]">{signal.horizon}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)] block mb-1">
                First Detected
              </span>
              <span className="font-mono text-xs text-[var(--ink)]">{fmtDate(signal.firstDetected)}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)] block mb-1">
                Last Updated
              </span>
              <span className="font-mono text-xs text-[var(--ink)]">{fmtDate(signal.lastUpdated)}</span>
            </div>
          </div>

          {/* Sources */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)] block mb-1.5">
              Sources
            </span>
            <div className="flex items-center gap-2">
              <BookOpen size={13} className="text-[var(--ink-secondary)]" />
              <span className="font-mono text-xs text-[var(--ink)]">
                {signal.sources.length} source{signal.sources.length !== 1 ? 's' : ''}
              </span>
              <span className="text-[var(--ink-tertiary)] text-[10px]">·</span>
              <span className="font-mono text-xs text-[var(--ink-secondary)]">
                {signal.triangulationCount} triangulation point{signal.triangulationCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Regions */}
          {signal.regions.length > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)] block mb-1.5">
                Regions
              </span>
              <div className="flex flex-wrap gap-1">
                {signal.regions.map((r) => (
                  <span
                    key={r}
                    className="px-2 py-0.5 rounded-md bg-[var(--panel)] border border-[var(--border)] font-mono text-[10px] text-[var(--ink-secondary)]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="shrink-0 px-5 py-4 border-t border-[var(--border)]">
          <Link
            href={`/signals/${signal.id}`}
            className="flex items-center justify-center gap-2 w-full rounded-lg
                       bg-[var(--tier-watch)] hover:opacity-90 transition-opacity
                       text-white text-sm font-medium py-2.5"
            onClick={onClose}
          >
            Open detail
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </>
  );
}
