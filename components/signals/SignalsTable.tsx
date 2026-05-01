'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { TierBadge } from '@/components/shared/TierBadge';
import { AgentIcon } from '@/components/shared/AgentIcon';
import { PpaChip } from '@/components/shared/PpaChip';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import { fmtDate } from '@/lib/format';
import type { Signal } from '@/lib/types';

type SortKey = 'id' | 'tier' | 'title' | 'agent' | 'confidence' | 'triangulationCount' | 'firstDetected' | 'lastUpdated';
type SortDir = 'asc' | 'desc';

const TIER_ORDER = { action: 0, attention: 1, watch: 2 };
const CONF_ORDER = { high: 0, moderate: 1, low: 2 };

function sortSignals(signals: Signal[], key: SortKey, dir: SortDir): Signal[] {
  const sorted = [...signals].sort((a, b) => {
    let cmp = 0;
    if (key === 'tier') {
      cmp = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
    } else if (key === 'confidence') {
      cmp = CONF_ORDER[a.confidence] - CONF_ORDER[b.confidence];
    } else if (key === 'triangulationCount') {
      cmp = a.triangulationCount - b.triangulationCount;
    } else if (key === 'firstDetected' || key === 'lastUpdated') {
      cmp = new Date(a[key]).getTime() - new Date(b[key]).getTime();
    } else {
      cmp = String(a[key]).localeCompare(String(b[key]));
    }
    return dir === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

interface SignalsTableProps {
  signals: Signal[];
  onHover: (signal: Signal | null) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

function SortIcon({ col, active, dir }: { col: SortKey; active: SortKey; dir: SortDir }) {
  if (col !== active) return <ArrowUpDown size={12} className="opacity-30" />;
  return dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
}

export function SignalsTable({ signals, onHover, sortKey, sortDir, onSort }: SignalsTableProps) {
  const router = useRouter();
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback((signal: Signal) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => onHover(signal), 250);
  }, [onHover]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  }, []);

  const sorted = sortSignals(signals, sortKey, sortDir);

  const thClass = "px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-secondary)] whitespace-nowrap cursor-pointer select-none hover:text-[var(--ink)] transition-colors";

  return (
    <div className="overflow-auto flex-1 min-h-0">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-[var(--surface)] border-b border-[var(--border)]">
          <tr>
            {([
              ['id', 'ID'],
              ['tier', 'Tier'],
              ['title', 'Title'],
              ['agent', 'Agent'],
              ['ppa', 'PPA'],
              ['regions', 'Regions'],
              ['confidence', 'Conf.'],
              ['triangulationCount', 'Tri.'],
              ['firstDetected', 'First Detected'],
              ['lastUpdated', 'Last Updated'],
            ] as [string, string][]).map(([key, label]) => {
              const isSortable = ['id', 'tier', 'title', 'agent', 'confidence', 'triangulationCount', 'firstDetected', 'lastUpdated'].includes(key);
              return (
                <th
                  key={key}
                  className={thClass}
                  onClick={isSortable ? () => onSort(key as SortKey) : undefined}
                  style={{ cursor: isSortable ? 'pointer' : 'default' }}
                >
                  <span className="inline-flex items-center gap-1">
                    {label}
                    {isSortable && <SortIcon col={key as SortKey} active={sortKey} dir={sortDir} />}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((signal, i) => (
            <tr
              key={signal.id}
              className={[
                'border-b border-[var(--border)] cursor-pointer transition-colors hover:bg-[var(--panel)]',
                i % 2 === 1 ? 'bg-[var(--panel)]/40' : '',
              ].join(' ')}
              onClick={() => router.push(`/signals/${signal.id}`)}
              onMouseEnter={() => handleMouseEnter(signal)}
              onMouseLeave={handleMouseLeave}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/signals/${signal.id}`); }}
              aria-label={`${signal.title} — ${signal.tier} tier`}
            >
              {/* ID */}
              <td className="px-3 py-2 font-mono text-[11px] text-[var(--ink-tertiary)] whitespace-nowrap">
                {signal.id}
              </td>
              {/* Tier */}
              <td className="px-3 py-2">
                <TierBadge tier={signal.tier} size="sm" />
              </td>
              {/* Title */}
              <td className="px-3 py-2 text-[var(--ink)] font-medium max-w-[280px]">
                <span className="block truncate">{signal.title}</span>
              </td>
              {/* Agent */}
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-1.5 text-[var(--ink-secondary)]">
                  <AgentIcon id={signal.agent} size={13} />
                </span>
              </td>
              {/* PPA */}
              <td className="px-3 py-2">
                <div className="flex gap-1 flex-wrap">
                  {signal.ppa.map((p) => (
                    <PpaChip key={p} pillar={p} />
                  ))}
                </div>
              </td>
              {/* Regions */}
              <td className="px-3 py-2">
                <div className="flex gap-1 flex-wrap">
                  {signal.regions.map((r) => (
                    <span key={r} className="font-mono text-[9px] border border-[var(--border)] rounded px-1 py-0.5 text-[var(--ink-tertiary)] whitespace-nowrap">
                      {r}
                    </span>
                  ))}
                </div>
              </td>
              {/* Confidence */}
              <td className="px-3 py-2">
                <ConfidenceMeter value={signal.confidence} />
              </td>
              {/* Triangulation */}
              <td className="px-3 py-2 font-mono text-[11px] text-[var(--ink-secondary)] text-center">
                {signal.triangulationCount}
              </td>
              {/* First detected */}
              <td className="px-3 py-2 font-mono text-[11px] text-[var(--ink-tertiary)] whitespace-nowrap">
                {fmtDate(signal.firstDetected)}
              </td>
              {/* Last updated */}
              <td className="px-3 py-2 font-mono text-[11px] text-[var(--ink-tertiary)] whitespace-nowrap">
                {fmtDate(signal.lastUpdated)}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={10} className="px-6 py-12 text-center text-[var(--ink-tertiary)] text-sm">
                No signals match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export type { SortKey, SortDir };
export { sortSignals };
