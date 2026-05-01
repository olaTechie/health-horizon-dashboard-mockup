import fs from 'node:fs';
import path from 'node:path';
import { SIGNALS } from './seed/signals.seed';
import { BRIEFS } from './seed/briefs.seed';
import { ASSETS } from './seed/assets.seed';
import { AGENTS } from './seed/agents.seed';
import type { Meta } from '../lib/types';

const OUT = path.join(process.cwd(), 'public', 'data');
fs.mkdirSync(OUT, { recursive: true });

const agents = AGENTS.map((a) => ({
  ...a,
  signalsOwned: SIGNALS.filter((s) => s.agent === a.id).length,
}));

const meta: Meta = {
  generatedAt: new Date().toISOString(),
  version: '0.1.0',
  totals: {
    signals: SIGNALS.length,
    briefs: BRIEFS.length,
    assets: ASSETS.length,
    agents: agents.length,
  },
  uptimePct: 99.94,
};

const write = (name: string, data: unknown) =>
  fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(data, null, 2));

write('signals', SIGNALS);
write('briefs', BRIEFS);
write('assets', ASSETS);
write('agents', agents);
write('meta', meta);

console.log(`Wrote ${SIGNALS.length} signals, ${BRIEFS.length} briefs, ${ASSETS.length} assets, ${agents.length} agents to public/data/`);
