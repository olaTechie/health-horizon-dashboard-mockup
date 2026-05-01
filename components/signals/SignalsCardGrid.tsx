'use client';

import Link from 'next/link';
import { TierBadge } from '@/components/shared/TierBadge';
import { AgentIcon, AGENT_LABEL } from '@/components/shared/AgentIcon';
import { PpaChip } from '@/components/shared/PpaChip';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import type { Signal } from '@/lib/types';

interface SignalsCardGridProps {
  signals: Signal[];
  onHover: (signal: Signal | null) => void;
}

export function SignalsCardGrid({ signals, onHover }: SignalsCardGridProps) {
  if (signals.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--ink-tertiary)] text-sm">
        No signals match the current filters.
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-3 gap-4 overflow-auto flex-1 min-h-0 content-start">
      {signals.map((signal) => (
        <article
          key={signal.id}
          className="relative flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--tier-watch)]/40 hover:shadow-sm transition-all group"
          onMouseEnter={() => onHover(signal)}
          onMouseLeave={() => onHover(null)}
        >
          {/* Tier badge — top right */}
          <div className="absolute top-3 right-3">
            <TierBadge tier={signal.tier} size="sm" />
          </div>

          {/* ID */}
          <span className="font-mono text-[10px] text-[var(--ink-tertiary)]">{signal.id}</span>

          {/* Title */}
          <h3 className="font-display text-sm font-semibold text-[var(--ink)] leading-snug pr-16">
            {signal.title}
          </h3>

          {/* Summary */}
          <p className="text-xs text-[var(--ink-secondary)] leading-relaxed line-clamp-3">
            {signal.summary}
          </p>

          {/* Agent row */}
          <div className="flex items-center gap-2 text-[var(--ink-secondary)]">
            <AgentIcon id={signal.agent} size={13} />
            <span className="text-[10px] font-mono text-[var(--ink-tertiary)]">
              {AGENT_LABEL[signal.agent]}
            </span>
          </div>

          {/* Region chips */}
          <div className="flex flex-wrap gap-1">
            {signal.regions.map((r) => (
              <span key={r} className="font-mono text-[9px] border border-[var(--border)] rounded px-1.5 py-0.5 text-[var(--ink-tertiary)]">
                {r}
              </span>
            ))}
          </div>

          {/* PPA chips */}
          <div className="flex flex-wrap gap-1">
            {signal.ppa.map((p) => (
              <PpaChip key={p} pillar={p} />
            ))}
          </div>

          {/* Confidence meter */}
          <ConfidenceMeter value={signal.confidence} />

          {/* CTA */}
          <div className="mt-auto pt-1 border-t border-[var(--border)]">
            <Link
              href={`/signals/${signal.id}`}
              className="text-[11px] font-mono text-[var(--ink-secondary)] hover:text-[var(--ink)] transition-colors group-hover:underline group-hover:underline-offset-2"
              tabIndex={0}
            >
              View →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
