// tests/generate-mock-data.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

describe('mock data generator', () => {
  beforeAll(() => {
    if (!fs.existsSync(DATA_DIR)) {
      throw new Error('Run `npm run generate:data` before this test');
    }
  });

  it('emits 5 JSON files', () => {
    for (const name of ['signals', 'briefs', 'assets', 'agents', 'meta']) {
      expect(fs.existsSync(path.join(DATA_DIR, `${name}.json`))).toBe(true);
    }
  });

  it('signals.json has 40 entries with unique IDs', () => {
    const signals = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'signals.json'), 'utf8'));
    expect(signals).toHaveLength(40);
    const ids = new Set(signals.map((s: { id: string }) => s.id));
    expect(ids.size).toBe(40);
  });

  it('every signal references valid asset IDs', () => {
    const signals = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'signals.json'), 'utf8'));
    const assets = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'assets.json'), 'utf8'));
    const assetIds = new Set(assets.map((a: { id: string }) => a.id));
    for (const s of signals) {
      for (const aid of s.affectedAssets) {
        expect(assetIds.has(aid)).toBe(true);
      }
    }
  });

  it('every brief references valid signal IDs', () => {
    const signals = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'signals.json'), 'utf8'));
    const briefs = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'briefs.json'), 'utf8'));
    const sigIds = new Set(signals.map((s: { id: string }) => s.id));
    for (const b of briefs) {
      for (const id of b.watchlistSignalIds) expect(sigIds.has(id)).toBe(true);
      for (const dd of b.thematicDeepDives) for (const id of dd.signalIds) expect(sigIds.has(id)).toBe(true);
    }
  });

  it('agents.json signalsOwned matches signals.json counts', () => {
    const signals = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'signals.json'), 'utf8'));
    const agents = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'agents.json'), 'utf8'));
    for (const a of agents) {
      const count = signals.filter((s: { agent: string }) => s.agent === a.id).length;
      expect(a.signalsOwned).toBe(count);
    }
  });

  it('tier distribution: 2 action, 8 attention, 30 watch', () => {
    const signals = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'signals.json'), 'utf8'));
    const counts = { action: 0, attention: 0, watch: 0 };
    for (const s of signals) counts[s.tier as keyof typeof counts]++;
    expect(counts.action).toBe(2);
    expect(counts.attention).toBe(8);
    expect(counts.watch).toBe(30);
  });
});
