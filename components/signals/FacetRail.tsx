'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { applyFilters, serializeFilters } from '@/lib/filters';
import type { FilterState } from '@/lib/filters';
import type { Signal, AlertTier, PPAPillar, AgentId, Region, BusinessSegment, Horizon, Confidence } from '@/lib/types';
import { AGENT_LABEL } from '@/components/shared/AgentIcon';

interface FacetRailProps {
  signals: Signal[];
  filters: FilterState;
}

type FacetDef<T extends string> = {
  label: string;
  key: keyof FilterState;
  options: T[];
  getLabel: (v: T) => string;
};

const TIERS: AlertTier[] = ['action', 'attention', 'watch'];
const PPAS: PPAPillar[] = ['promote', 'protect', 'access'];
const AGENTS: AgentId[] = ['infectious', 'occupational', 'regulatory', 'climate', 'psychosocial'];
const REGIONS: Region[] = ['AMER', 'EMEA', 'APAC', 'LATAM', 'global'];
const SEGMENTS: BusinessSegment[] = ['upstream', 'integrated-gas', 'downstream', 'renewables'];
const HORIZONS: Horizon[] = ['immediate', '12mo', '1-5yr'];
const CONFIDENCES: Confidence[] = ['high', 'moderate', 'low'];

function countWith<T extends string>(
  signals: Signal[],
  filters: FilterState,
  key: keyof FilterState,
  value: T
): number {
  const candidate = { ...filters, [key]: [value] } as FilterState;
  return applyFilters(signals, candidate).length;
}

function ChipLabel({ label }: { label: string }) {
  return <span className="text-[10px] font-mono uppercase tracking-wider">{label}</span>;
}

export function FacetRail({ signals, filters }: FacetRailProps) {
  const router = useRouter();

  function update(next: FilterState) {
    const qs = serializeFilters(next);
    router.push(`/signals${qs ? `?${qs}` : ''}`);
  }

  function toggleFacet<T extends string>(key: keyof FilterState, value: T) {
    const current = (filters[key] as T[] | undefined) ?? [];
    const exists = current.includes(value);
    const next = exists ? current.filter((v) => v !== value) : [...current, value];
    update({ ...filters, [key]: next.length ? next : undefined } as FilterState);
  }

  function removeFacet<T extends string>(key: keyof FilterState, value: T) {
    const current = (filters[key] as T[] | undefined) ?? [];
    const next = current.filter((v) => v !== value);
    update({ ...filters, [key]: next.length ? next : undefined } as FilterState);
  }

  function clearAll() {
    update({});
  }

  // Collect active chips
  const chips: Array<{ key: keyof FilterState; value: string; label: string }> = [];
  const addChips = <T extends string>(key: keyof FilterState, opts: T[], getLabel: (v: T) => string) => {
    const active = (filters[key] as T[] | undefined) ?? [];
    active.forEach((v) => {
      if (opts.includes(v)) chips.push({ key, value: v, label: getLabel(v) });
    });
  };
  addChips('tiers', TIERS, (v) => `Tier: ${v}`);
  addChips('ppas', PPAS, (v) => `PPA: ${v}`);
  addChips('agents', AGENTS, (v) => AGENT_LABEL[v]);
  addChips('regions', REGIONS, (v) => v);
  addChips('segments', SEGMENTS, (v) => v);
  addChips('horizons', HORIZONS, (v) => v);
  addChips('confidences', CONFIDENCES, (v) => `Conf: ${v}`);

  function renderSection<T extends string>(facet: FacetDef<T>) {
    const active = (filters[facet.key] as T[] | undefined) ?? [];
    return (
      <details key={facet.key} open className="border-b border-[var(--border)] last:border-0">
        <summary className="cursor-pointer select-none px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--ink-secondary)] hover:text-[var(--ink)] list-none flex items-center justify-between">
          {facet.label}
          <span className="text-[var(--ink-tertiary)] text-[10px]">▾</span>
        </summary>
        <div className="pb-2 px-2">
          {facet.options.map((opt) => {
            const checked = active.includes(opt);
            const count = countWith(signals, filters, facet.key, opt);
            return (
              <label
                key={opt}
                className="flex items-center gap-2 rounded px-2 py-1 cursor-pointer hover:bg-[var(--panel)] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFacet(facet.key, opt)}
                  className="accent-[var(--tier-watch)] size-3 rounded"
                />
                <span className="flex-1 text-[11px] text-[var(--ink)] truncate">{facet.getLabel(opt)}</span>
                <span className="text-[10px] font-mono text-[var(--ink-tertiary)]">{count}</span>
              </label>
            );
          })}
        </div>
      </details>
    );
  }

  const facets: FacetDef<string>[] = [
    { label: 'Tier', key: 'tiers', options: TIERS as string[], getLabel: (v) => v.charAt(0).toUpperCase() + v.slice(1) },
    { label: 'PPA', key: 'ppas', options: PPAS as string[], getLabel: (v) => v.charAt(0).toUpperCase() + v.slice(1) },
    { label: 'Agent', key: 'agents', options: AGENTS as string[], getLabel: (v) => AGENT_LABEL[v as AgentId] },
    { label: 'Region', key: 'regions', options: REGIONS as string[], getLabel: (v) => v },
    { label: 'Segment', key: 'segments', options: SEGMENTS as string[], getLabel: (v) => v.charAt(0).toUpperCase() + v.slice(1) },
    { label: 'Horizon', key: 'horizons', options: HORIZONS as string[], getLabel: (v) => v },
    { label: 'Confidence', key: 'confidences', options: CONFIDENCES as string[], getLabel: (v) => v.charAt(0).toUpperCase() + v.slice(1) },
  ];

  return (
    <aside
      className="w-60 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] overflow-y-auto"
      aria-label="Signal filters"
    >
      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="px-3 py-3 border-b border-[var(--border)] space-y-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-tertiary)]">
              Active filters
            </span>
            <button
              onClick={clearAll}
              className="text-[10px] text-[var(--ink-secondary)] hover:text-[var(--ink)] transition-colors"
              aria-label="Clear all filters"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {chips.map((chip) => (
              <span
                key={`${String(chip.key)}-${chip.value}`}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--panel)] border border-[var(--border)] px-2 py-0.5"
              >
                <ChipLabel label={chip.label} />
                <button
                  onClick={() => removeFacet(chip.key, chip.value)}
                  className="text-[var(--ink-tertiary)] hover:text-[var(--ink)] ml-0.5"
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Facet sections */}
      <div className="divide-y divide-[var(--border)]">
        {facets.map((facet) => renderSection(facet as FacetDef<string>))}
      </div>
    </aside>
  );
}
