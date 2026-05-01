// tests/data.test.ts
import { describe, it, expect } from 'vitest';
import { loadAll } from '@/lib/data';

describe('loadAll', () => {
  it('returns all 4 collections + meta', async () => {
    const { signals, briefs, assets, agents, meta } = await loadAll();
    expect(signals).toHaveLength(40);
    expect(briefs).toHaveLength(4);
    expect(assets).toHaveLength(22);
    expect(agents).toHaveLength(5);
    expect(meta.version).toBe('0.1.0');
  });
});
