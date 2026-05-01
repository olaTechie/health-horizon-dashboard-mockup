'use client';

import { Sparkline } from '@/components/shared/Sparkline';
import type { Signal, Meta } from '@/lib/types';

interface Props {
  signals: Signal[];
  meta: Meta;
}

// Generate 30 fake-but-plausible data points centered around an anchor value
function fakeSeries(anchor: number, variance: number): number[] {
  const seed = anchor * 7 + variance;
  return Array.from({ length: 30 }, (_, i) => {
    const noise = Math.sin(seed + i * 1.3) * variance + Math.cos(seed + i * 0.7) * variance * 0.5;
    return Math.max(0, anchor + noise);
  });
}

function confToNum(c: string): number {
  if (c === 'high') return 3;
  if (c === 'moderate') return 2;
  return 1;
}

function numToConf(n: number): string {
  if (n >= 2.5) return 'High';
  if (n >= 1.5) return 'Moderate';
  return 'Low';
}

interface KpiTileProps {
  label: string;
  value: string;
  subtext?: string;
  sparkData: number[];
  sparkColor?: string;
}

function KpiTile({ label, value, subtext, sparkData, sparkColor }: KpiTileProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
      <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)]">
        {label}
      </span>
      <span className="font-mono text-3xl font-semibold text-[var(--ink)] leading-none">
        {value}
      </span>
      {subtext && (
        <span className="text-[11px] text-[var(--ink-secondary)]">{subtext}</span>
      )}
      <div className="mt-1">
        <Sparkline data={sparkData} color={sparkColor ?? 'var(--ink-secondary)'} />
      </div>
    </div>
  );
}

export function KpiStrip({ signals, meta }: Props) {
  const activeCount = signals.length;
  const actionCount = signals.filter((s) => s.tier === 'action').length;

  // Elevated-risk regions = regions that have at least one action or attention signal
  const elevatedRegions = new Set(
    signals
      .filter((s) => s.tier === 'action' || s.tier === 'attention')
      .flatMap((s) => s.regions),
  );
  const elevatedCount = elevatedRegions.size;

  const meanConfNum =
    signals.reduce((acc, s) => acc + confToNum(s.confidence), 0) / signals.length;
  const meanConfLabel = numToConf(meanConfNum);

  const uptimePct = meta.uptimePct;

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5"
      role="region"
      aria-label="Key performance indicators"
    >
      <KpiTile
        label="Active Signals"
        value={activeCount.toLocaleString()}
        subtext="Across all agents"
        sparkData={fakeSeries(38, 4)}
        sparkColor="var(--tier-watch)"
      />
      <KpiTile
        label="Action Tier"
        value={actionCount.toLocaleString()}
        subtext="Require executive review"
        sparkData={fakeSeries(2, 1)}
        sparkColor="var(--tier-action)"
      />
      <KpiTile
        label="Elevated-Risk Regions"
        value={elevatedCount.toLocaleString()}
        subtext="Action or Attention signals"
        sparkData={fakeSeries(4, 1.5)}
        sparkColor="var(--tier-attention)"
      />
      <KpiTile
        label="Mean Confidence"
        value={meanConfLabel}
        subtext={`Score: ${meanConfNum.toFixed(1)} / 3.0`}
        sparkData={fakeSeries(2.2, 0.3)}
        sparkColor="var(--ppa-promote)"
      />
      <KpiTile
        label="Coverage Uptime"
        value={`${uptimePct.toFixed(2)}%`}
        subtext="30-day rolling average"
        sparkData={fakeSeries(99.9, 0.08)}
        sparkColor="var(--ppa-protect)"
      />
    </div>
  );
}
