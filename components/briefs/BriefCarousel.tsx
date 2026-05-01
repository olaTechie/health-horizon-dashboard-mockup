'use client';

import { cn } from '@/lib/cn';
import { fmtDate } from '@/lib/format';
import type { Brief, Signal } from '@/lib/types';

interface BriefCarouselProps {
  briefs: Brief[];
  signals: Signal[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Returns the calendar quarter boundaries for a quarter string like "Q2 2026" */
function quarterBounds(quarter: string): { start: Date; end: Date } {
  const match = quarter.match(/Q(\d)\s+(\d{4})/);
  if (!match) return { start: new Date(0), end: new Date(0) };
  const q = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);
  const startMonth = (q - 1) * 3; // 0-indexed
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0, 23, 59, 59); // last day of quarter
  return { start, end };
}

function computeKeyStats(brief: Brief, signals: Signal[]) {
  const { start, end } = quarterBounds(brief.quarter);

  // Signals scanned: signals whose firstDetected falls within the quarter
  const scanned = signals.filter((s) => {
    const d = new Date(s.firstDetected);
    return d >= start && d <= end;
  });

  // Action-tier issued: signals at action tier whose lastUpdated is within quarter
  const actionTier = signals.filter((s) => {
    if (s.tier !== 'action') return false;
    const d = new Date(s.lastUpdated);
    return d >= start && d <= end;
  });

  // Sources triangulated: sum of triangulationCount for all signals in quarter
  const sourcesTriangulated = scanned.reduce((sum, s) => sum + s.triangulationCount, 0);

  return {
    scanned: scanned.length,
    actionTier: actionTier.length,
    sourcesTriangulated,
  };
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
}

export function BriefCarousel({ briefs, signals, selectedId, onSelect }: BriefCarouselProps) {
  return (
    <div
      className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
      style={{ scrollbarWidth: 'thin' }}
      aria-label="Quarterly briefs carousel"
      role="list"
    >
      {briefs.map((brief, idx) => {
        const isSelected = brief.id === selectedId;
        const isMostRecent = idx === 0;
        const stats = computeKeyStats(brief, signals);

        // Extract "Quarter N" label and "YYYY" from quarter string
        const quarterMatch = brief.quarter.match(/^(Q\d)\s+(\d{4})$/);
        const qLabel = quarterMatch ? quarterMatch[1] : brief.quarter;
        const yearLabel = quarterMatch ? quarterMatch[2] : '';

        // Signed-off initials
        const signatoryInitials = brief.signedOffBy
          .map((s) => initials(s.name))
          .join(' · ');

        return (
          <button
            key={brief.id}
            role="listitem"
            onClick={() => onSelect(brief.id)}
            aria-label={`${brief.quarter} brief${isSelected ? ' — currently selected' : ''}`}
            className={cn(
              'snap-start shrink-0 flex flex-col rounded-xl border bg-[var(--surface)] p-6 text-left transition-all duration-200 cursor-pointer',
              'hover:border-[var(--ink-secondary)]',
              isMostRecent
                ? 'ring-2 ring-[var(--ink)]/30'
                : 'border-[var(--border)]',
              isSelected && 'border-[var(--ink)]/40 shadow-lg',
            )}
            style={{
              width: '340px',
              minWidth: '340px',
              height: '460px',
              transform: isMostRecent ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: 'top center',
            }}
          >
            {/* Large quarter display number */}
            <div
              className="font-display text-[64px] leading-none text-[var(--ink)] mb-1 select-none"
              style={{ fontVariationSettings: '"opsz" 144', lineHeight: 1 }}
              aria-hidden="true"
            >
              {qLabel}
            </div>

            {/* Quarter label */}
            <div className="font-mono text-sm text-[var(--ink-secondary)] mb-1 uppercase tracking-widest">
              {yearLabel}
            </div>

            {/* Published date */}
            <div className="font-mono text-xs text-[var(--ink-tertiary)] small-caps mb-4">
              Published {fmtDate(brief.publishedAt)}
            </div>

            {/* Abstract excerpt */}
            <p className="text-sm text-[var(--ink-secondary)] leading-relaxed flex-1 line-clamp-3 mb-4">
              {brief.abstract}
            </p>

            {/* Key-stat strip */}
            <div className="grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-3 mb-3">
              <div className="text-center">
                <div className="font-mono text-lg font-semibold text-[var(--ink)]">{stats.scanned}</div>
                <div className="text-[10px] text-[var(--ink-tertiary)] leading-tight">Signals scanned</div>
              </div>
              <div className="text-center border-x border-[var(--border)]">
                <div className="font-mono text-lg font-semibold text-[var(--tier-action)]">{stats.actionTier}</div>
                <div className="text-[10px] text-[var(--ink-tertiary)] leading-tight">Action-tier issued</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-lg font-semibold text-[var(--ink)]">{stats.sourcesTriangulated}</div>
                <div className="text-[10px] text-[var(--ink-tertiary)] leading-tight">Sources triangulated</div>
              </div>
            </div>

            {/* Sign-off initials */}
            <div className="font-mono text-[10px] text-[var(--ink-tertiary)] truncate">
              {signatoryInitials}
            </div>
          </button>
        );
      })}
    </div>
  );
}
