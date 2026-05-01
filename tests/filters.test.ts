// tests/filters.test.ts
import { describe, it, expect } from 'vitest';
import { applyFilters, parseFilterParams, serializeFilters } from '@/lib/filters';
import type { Signal } from '@/lib/types';

const baseSignal = (over: Partial<Signal> = {}): Signal => ({
  id: 'SIG-T-001',
  title: 't', summary: 's', tier: 'watch', ppa: ['protect'], agent: 'infectious',
  regions: ['EMEA'], affectedAssets: [], affectedSegments: ['upstream'],
  horizon: '12mo', confidence: 'moderate',
  firstDetected: '2026-01-01', lastUpdated: '2026-01-02',
  sources: [], triangulationCount: 0, seamMapping: [],
  recommendedAction: '', evidenceTrail: [],
  ...over,
});

describe('applyFilters', () => {
  it('filters by tier', () => {
    const s = [baseSignal({ tier: 'action' }), baseSignal({ id: 'X', tier: 'watch' })];
    expect(applyFilters(s, { tiers: ['action'] })).toHaveLength(1);
  });
  it('filters by ppa (any-match)', () => {
    const s = [baseSignal({ ppa: ['promote'] }), baseSignal({ id: 'X', ppa: ['protect'] })];
    expect(applyFilters(s, { ppas: ['promote'] })).toHaveLength(1);
  });
  it('filters by region (any-match)', () => {
    const s = [baseSignal({ regions: ['AMER'] }), baseSignal({ id: 'X', regions: ['EMEA'] })];
    expect(applyFilters(s, { regions: ['AMER'] })).toHaveLength(1);
  });
  it('returns all when filters empty', () => {
    const s = [baseSignal(), baseSignal({ id: 'X' })];
    expect(applyFilters(s, {})).toHaveLength(2);
  });
  it('combines filters with AND', () => {
    const s = [
      baseSignal({ tier: 'action', regions: ['AMER'] }),
      baseSignal({ id: 'X', tier: 'action', regions: ['EMEA'] }),
    ];
    expect(applyFilters(s, { tiers: ['action'], regions: ['AMER'] })).toHaveLength(1);
  });
});

describe('URL filter serialization', () => {
  it('roundtrips filter state', () => {
    const filters = { tiers: ['action' as const], ppas: ['protect' as const], regions: ['AMER' as const] };
    const params = serializeFilters(filters);
    const parsed = parseFilterParams(new URLSearchParams(params));
    expect(parsed.tiers).toEqual(['action']);
    expect(parsed.ppas).toEqual(['protect']);
    expect(parsed.regions).toEqual(['AMER']);
  });
});
