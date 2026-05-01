'use client';

import { useMemo } from 'react';
import { TierDot } from '@/components/shared/TierBadge';
import { AGENT_LABEL } from '@/components/shared/AgentIcon';
import type { Signal, AgentId } from '@/lib/types';

const AGENTS: AgentId[] = ['infectious', 'occupational', 'regulatory', 'climate', 'psychosocial'];

const TIER_COLORS: Record<string, string> = {
  action: 'var(--tier-action)',
  attention: 'var(--tier-attention)',
  watch: 'var(--tier-watch)',
};

interface SignalsTimelineProps {
  signals: Signal[];
  onHover: (signal: Signal | null) => void;
}

export function SignalsTimeline({ signals, onHover }: SignalsTimelineProps) {
  const { minTime, range } = useMemo(() => {
    if (signals.length === 0) {
      const now = Date.now();
      return { minTime: now - 365 * 86400000, range: 365 * 86400000 };
    }
    const times = signals.flatMap((s) => [
      new Date(s.firstDetected).getTime(),
      new Date(s.lastUpdated).getTime(),
    ]);
    const mn = Math.min(...times);
    const mx = Math.max(...times);
    const pad = (mx - mn) * 0.04;
    return { minTime: mn - pad, range: mx - mn + pad * 2 };
  }, [signals]);

  function pct(ts: number) {
    return ((ts - minTime) / range) * 100;
  }

  // Axis ticks
  const ticks = useMemo(() => {
    const count = 6;
    return Array.from({ length: count }, (_, i) => {
      const ts = minTime + (range / (count - 1)) * i;
      const date = new Date(ts);
      return {
        ts,
        label: date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
        pct: ((ts - minTime) / range) * 100,
      };
    });
  }, [minTime, range]);

  const byAgent = useMemo(() => {
    return AGENTS.map((agentId) => ({
      agentId,
      signals: signals.filter((s) => s.agent === agentId),
    }));
  }, [signals]);

  if (signals.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--ink-tertiary)] text-sm">
        No signals match the current filters.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="min-w-[700px]">
        {/* Time axis */}
        <div className="flex items-end mb-3 pl-40">
          <div className="flex-1 relative h-6">
            {ticks.map((tick, i) => (
              <div
                key={i}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: `${tick.pct}%`, transform: 'translateX(-50%)' }}
              >
                <span className="font-mono text-[9px] text-[var(--ink-tertiary)] whitespace-nowrap">
                  {tick.label}
                </span>
                <div className="w-px h-3 bg-[var(--border)] mt-0.5" />
              </div>
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border)]" />
          </div>
        </div>

        {/* Swim lanes */}
        <div className="space-y-2">
          {byAgent.map(({ agentId, signals: agentSignals }) => (
            <div key={agentId} className="flex items-start gap-0">
              {/* Lane label */}
              <div className="w-40 shrink-0 pr-3 pt-2 text-right">
                <span className="text-[10px] font-mono text-[var(--ink-secondary)] leading-tight block">
                  {AGENT_LABEL[agentId]}
                </span>
              </div>

              {/* Timeline track */}
              <div className="flex-1 relative min-h-[48px] border-b border-[var(--border)]/60 py-1">
                {agentSignals.length === 0 && (
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-[var(--border)]/40 border-dashed border-t border-[var(--border)]" />
                  </div>
                )}
                {agentSignals.map((signal) => {
                  const startPct = pct(new Date(signal.firstDetected).getTime());
                  const endPct = pct(new Date(signal.lastUpdated).getTime());
                  const widthPct = Math.max(endPct - startPct, 1);

                  return (
                    <div
                      key={signal.id}
                      className="absolute flex items-center group cursor-pointer"
                      style={{
                        left: `${startPct}%`,
                        width: `${widthPct}%`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                      onMouseEnter={() => onHover(signal)}
                      onMouseLeave={() => onHover(null)}
                      title={signal.title}
                    >
                      {/* Bar */}
                      <div
                        className="h-5 w-full rounded-sm opacity-70 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: TIER_COLORS[signal.tier] }}
                      />
                      {/* Tier dot at right end */}
                      <div className="absolute right-0 translate-x-1/2">
                        <TierDot tier={signal.tier} pulse={signal.tier === 'action'} />
                      </div>
                      {/* Tooltip label on hover */}
                      <div className="absolute bottom-6 left-0 hidden group-hover:block z-20 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-2 py-1.5 shadow-lg min-w-[160px] max-w-[240px] pointer-events-none">
                        <p className="text-[10px] font-mono text-[var(--ink-tertiary)]">{signal.id}</p>
                        <p className="text-[11px] font-medium text-[var(--ink)] leading-snug mt-0.5 line-clamp-2">
                          {signal.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pl-40">
          {(['action', 'attention', 'watch'] as const).map((tier) => (
            <div key={tier} className="flex items-center gap-1.5">
              <div className="h-3 w-6 rounded-sm opacity-70" style={{ backgroundColor: TIER_COLORS[tier] }} />
              <span className="text-[10px] font-mono text-[var(--ink-tertiary)] capitalize">{tier}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
