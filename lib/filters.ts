import type { Signal, AlertTier, PPAPillar, Region, AgentId, BusinessSegment, Horizon, Confidence } from './types';

export interface FilterState {
  tiers?: AlertTier[];
  ppas?: PPAPillar[];
  regions?: Region[];
  agents?: AgentId[];
  segments?: BusinessSegment[];
  horizons?: Horizon[];
  confidences?: Confidence[];
  search?: string;
}

const anyMatch = <T>(want: T[] | undefined, have: T[]) =>
  !want || want.length === 0 || want.some((w) => have.includes(w));

const oneOf = <T>(want: T[] | undefined, have: T) =>
  !want || want.length === 0 || want.includes(have);

export function applyFilters(signals: Signal[], f: FilterState): Signal[] {
  const q = f.search?.toLowerCase().trim();
  return signals.filter((s) =>
    oneOf(f.tiers, s.tier) &&
    anyMatch(f.ppas, s.ppa) &&
    anyMatch(f.regions, s.regions) &&
    oneOf(f.agents, s.agent) &&
    anyMatch(f.segments, s.affectedSegments) &&
    oneOf(f.horizons, s.horizon) &&
    oneOf(f.confidences, s.confidence) &&
    (!q || s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q))
  );
}

export function parseFilterParams(p: URLSearchParams): FilterState {
  const arr = (k: string) => p.get(k)?.split(',').filter(Boolean);
  return {
    tiers: arr('tier') as AlertTier[] | undefined,
    ppas: arr('ppa') as PPAPillar[] | undefined,
    regions: arr('region') as Region[] | undefined,
    agents: arr('agent') as AgentId[] | undefined,
    segments: arr('segment') as BusinessSegment[] | undefined,
    horizons: arr('horizon') as Horizon[] | undefined,
    confidences: arr('confidence') as Confidence[] | undefined,
    search: p.get('q') ?? undefined,
  };
}

export function serializeFilters(f: FilterState): string {
  const p = new URLSearchParams();
  const set = (k: string, v?: string[]) => v && v.length && p.set(k, v.join(','));
  set('tier', f.tiers);
  set('ppa', f.ppas);
  set('region', f.regions);
  set('agent', f.agents);
  set('segment', f.segments);
  set('horizon', f.horizons);
  set('confidence', f.confidences);
  if (f.search) p.set('q', f.search);
  return p.toString();
}
