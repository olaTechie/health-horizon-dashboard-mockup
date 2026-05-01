import type { Signal, Brief, Asset, Agent, Meta } from './types';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

async function fetchJSON<T>(name: string): Promise<T> {
  // Use Node fs when running server-side or in test environments (jsdom runs in Node)
  if (typeof process !== 'undefined' && typeof process.versions?.node === 'string') {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const file = path.join(process.cwd(), 'public', 'data', `${name}.json`);
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  }
  const res = await fetch(`${BASE}/data/${name}.json`);
  if (!res.ok) throw new Error(`Failed to load ${name}: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function loadSignals() { return fetchJSON<Signal[]>('signals'); }
export async function loadBriefs() { return fetchJSON<Brief[]>('briefs'); }
export async function loadAssets() { return fetchJSON<Asset[]>('assets'); }
export async function loadAgents() { return fetchJSON<Agent[]>('agents'); }
export async function loadMeta() { return fetchJSON<Meta>('meta'); }

export async function loadAll() {
  const [signals, briefs, assets, agents, meta] = await Promise.all([
    loadSignals(), loadBriefs(), loadAssets(), loadAgents(), loadMeta(),
  ]);
  return { signals, briefs, assets, agents, meta };
}
