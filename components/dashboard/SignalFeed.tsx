import Link from 'next/link';
import { TierDot } from '@/components/shared/TierBadge';
import { AgentIcon } from '@/components/shared/AgentIcon';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import { fmtRelative } from '@/lib/format';
import type { Signal } from '@/lib/types';

interface Props {
  signals: Signal[];
}

export function SignalFeed({ signals }: Props) {
  // Sort by lastUpdated descending, take top 8
  const recent = [...signals]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 8);

  return (
    <section
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
      aria-label="Recent signal feed"
    >
      <div className="px-6 pt-5 pb-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-[var(--ink)]">Recent Signal Activity</h2>
        <p className="text-[11px] text-[var(--ink-tertiary)] mt-0.5">8 most recently updated signals</p>
      </div>

      <ul className="divide-y divide-[var(--border)]">
        {recent.map((signal) => (
          <li key={signal.id}>
            <Link
              href={`/signals/${signal.id}`}
              className="group flex items-center gap-4 px-6 py-3.5 hover:bg-[var(--panel)] transition-colors"
              aria-label={`${signal.title} — ${signal.tier} tier, updated ${fmtRelative(signal.lastUpdated)}`}
            >
              {/* Tier dot */}
              <TierDot tier={signal.tier} pulse={signal.tier === 'action'} />

              {/* Title */}
              <span className="flex-1 min-w-0 text-sm text-[var(--ink)] truncate font-medium group-hover:underline group-hover:underline-offset-2 leading-snug">
                {signal.title}
              </span>

              {/* Agent icon */}
              <span className="shrink-0 text-[var(--ink-secondary)]">
                <AgentIcon id={signal.agent} size={14} />
              </span>

              {/* Region chips */}
              <div className="hidden lg:flex items-center gap-1 shrink-0">
                {signal.regions.slice(0, 2).map((r) => (
                  <span
                    key={r}
                    className="font-mono text-[9px] border border-[var(--border)] rounded px-1 py-0.5 text-[var(--ink-tertiary)]"
                  >
                    {r}
                  </span>
                ))}
                {signal.regions.length > 2 && (
                  <span className="font-mono text-[9px] text-[var(--ink-tertiary)]">
                    +{signal.regions.length - 2}
                  </span>
                )}
              </div>

              {/* Confidence meter */}
              <div className="shrink-0">
                <ConfidenceMeter value={signal.confidence} />
              </div>

              {/* Relative time */}
              <span className="font-mono text-[10px] text-[var(--ink-tertiary)] shrink-0 w-20 text-right">
                {fmtRelative(signal.lastUpdated)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="px-6 py-3 border-t border-[var(--border)]">
        <Link
          href="/signals"
          className="font-mono text-xs text-[var(--ink-secondary)] hover:text-[var(--ink)] transition-colors"
        >
          View all {signals.length.toLocaleString()} signals →
        </Link>
      </div>
    </section>
  );
}
