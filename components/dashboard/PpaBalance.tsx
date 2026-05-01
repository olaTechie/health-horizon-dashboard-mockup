'use client';

import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Signal, PPAPillar } from '@/lib/types';

interface Props {
  signals: Signal[];
}

const PILLARS: PPAPillar[] = ['promote', 'protect', 'access'];
const PILLAR_LABEL: Record<PPAPillar, string> = {
  promote: 'Promote',
  protect: 'Protect',
  access: 'Access',
};

const TIER_COLORS = {
  watch: 'var(--tier-watch)',
  attention: 'var(--tier-attention)',
  action: 'var(--tier-action)',
} as const;

type TierKey = keyof typeof TIER_COLORS;

interface RowData {
  pillar: PPAPillar;
  label: string;
  watch: number;
  attention: number;
  action: number;
  total: number;
}

// Custom tooltip for recharts
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-lg">
      <p className="font-mono text-xs font-semibold text-[var(--ink)] mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-mono text-xs" style={{ color: entry.fill }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function PpaBalance({ signals }: Props) {
  const router = useRouter();

  const rows: RowData[] = PILLARS.map((pillar) => {
    const relevant = signals.filter((s) => s.ppa.includes(pillar));
    return {
      pillar,
      label: PILLAR_LABEL[pillar],
      watch: relevant.filter((s) => s.tier === 'watch').length,
      attention: relevant.filter((s) => s.tier === 'attention').length,
      action: relevant.filter((s) => s.tier === 'action').length,
      total: relevant.length,
    };
  });

  const handleClick = (pillar: PPAPillar) => {
    router.push(`/signals?ppa=${pillar}`);
  };

  return (
    <section
      className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5"
      aria-label="PPA pillar balance"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--ink)]">PPA Pillar Balance</h2>
        <span className="font-mono text-[10px] text-[var(--ink-tertiary)]">Click row to filter</span>
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        {(Object.entries(TIER_COLORS) as Array<[TierKey, string]>).map(([tier, color]) => (
          <span key={tier} className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--ink-secondary)]">
            <span className="size-2 rounded-sm" style={{ background: color }} />
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </span>
        ))}
      </div>

      {/* Bars */}
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <button
            key={row.pillar}
            onClick={() => handleClick(row.pillar)}
            className="group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tier-watch)] focus-visible:ring-offset-1 rounded-md"
            aria-label={`Filter signals by ${row.label} pillar — ${row.total} signals`}
          >
            <div className="flex items-center gap-3">
              <span className="w-14 font-mono text-[11px] text-[var(--ink-secondary)] shrink-0">
                {row.label}
              </span>
              <div className="flex-1 h-8 flex rounded overflow-hidden group-hover:opacity-90 transition-opacity">
                {row.watch > 0 && (
                  <div
                    style={{
                      width: `${(row.watch / row.total) * 100}%`,
                      background: TIER_COLORS.watch,
                    }}
                    title={`Watch: ${row.watch}`}
                    className="h-full transition-all"
                  />
                )}
                {row.attention > 0 && (
                  <div
                    style={{
                      width: `${(row.attention / row.total) * 100}%`,
                      background: TIER_COLORS.attention,
                    }}
                    title={`Attention: ${row.attention}`}
                    className="h-full transition-all"
                  />
                )}
                {row.action > 0 && (
                  <div
                    style={{
                      width: `${(row.action / row.total) * 100}%`,
                      background: TIER_COLORS.action,
                    }}
                    title={`Action: ${row.action}`}
                    className="h-full transition-all"
                  />
                )}
              </div>
              <span className="font-mono text-xs text-[var(--ink-tertiary)] w-6 text-right shrink-0">
                {row.total}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Recharts hidden bar for accessibility */}
      <div className="sr-only" aria-hidden>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={rows} layout="vertical">
            <XAxis type="number" />
            <YAxis type="category" dataKey="label" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="watch" stackId="a" fill={TIER_COLORS.watch} name="Watch" />
            <Bar dataKey="attention" stackId="a" fill={TIER_COLORS.attention} name="Attention" />
            <Bar dataKey="action" stackId="a" fill={TIER_COLORS.action} name="Action">
              {rows.map((entry) => (
                <Cell key={entry.pillar} fill={TIER_COLORS.action} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
