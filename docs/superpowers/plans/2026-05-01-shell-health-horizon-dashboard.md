# Shell Health Horizon Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, GitHub-Pages-hostable Next.js prototype demonstrating the Shell Health Horizon Scanning Executive Intelligence Dashboard (RFI Deliverable C), with five views, dual-theme (editorial + ops), real-event-grounded mock data, world map, and quarterly briefs reader.

**Architecture:** Next.js 15 App Router with `output: 'export'`. Static JSON in `/public/data/` modelled after the agent layer's expected payload. Theme via `data-theme` + CSS variables. MapLibre GL with bundled topojson. Deployed to GitHub Pages via Action.

**Tech Stack:** Next.js 15, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui, Recharts, MapLibre GL, Framer Motion, Lucide icons, Vitest, tsx.

**Working directory:** `shell-health-horizon-dashboard/` (already exists with `docs/` and a git repo initialized; commit `c86ada8` is the spec).

---

## File Structure (locked from spec §8)

```
app/                              # routes
  layout.tsx                      # root + theme + side rail + footer
  page.tsx                        # /
  signals/page.tsx
  signals/[id]/page.tsx
  map/page.tsx
  briefs/page.tsx
  globals.css
components/
  ui/                             # shadcn primitives, copied not imported
  nav/{SideRail,ThemeToggle,GlobalFilters,Footer}.tsx
  dashboard/{HeroTicker,KpiStrip,PpaBalance,AgentGrid,SnapshotMap,SignalFeed}.tsx
  signals/{FacetRail,SignalsTable,SignalsCardGrid,SignalsTimeline,QuickPeek}.tsx
  signal-detail/{EvidenceTrail,SourceCitations,TriangulationDiagram,AffectedAssets,SidePanel}.tsx
  map/{WorldMap,SignalSheet,TimeScrubber,LayerToggles}.tsx
  briefs/{BriefCarousel,BriefReader,BriefMiniTOC}.tsx
  shared/{TierBadge,PpaChip,AgentIcon,ConfidenceMeter,SourceTypeIcon,Sparkline}.tsx
lib/
  types.ts
  data.ts
  filters.ts
  theme.ts
  format.ts
scripts/
  generate-mock-data.ts
  seed/{signals,briefs,assets,agents}.seed.ts
public/
  data/{signals,briefs,assets,agents,meta}.json   # generated
  briefs/*.pdf                                     # stub PDFs (4 placeholders)
  world-110m.json                                  # bundled
  fonts/{Fraunces,Inter,JetBrainsMono}/...
tests/
  data.test.ts
  filters.test.ts
  generate-mock-data.test.ts
.github/workflows/deploy.yml
next.config.mjs
package.json
tsconfig.json
vitest.config.ts
README.md
```

---

## Milestone 0 — Project Bootstrap

### Task 0.1: Initialize Next.js project in existing directory

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`, `next-env.d.ts`

- [ ] **Step 1: Run `cd shell-health-horizon-dashboard && npx create-next-app@15 . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm --no-turbopack`**

When prompted "would you like to use Turbopack" answer No. The directory already contains `docs/` and a git repo — `create-next-app` will refuse if files exist. Workaround: scaffold to a temp dir then move:

```bash
cd "$(dirname shell-health-horizon-dashboard)"
npx create-next-app@15 _tmp-scaffold --typescript --tailwind --eslint --app \
  --src-dir=false --import-alias "@/*" --use-npm --no-turbopack
rsync -a --ignore-existing _tmp-scaffold/ shell-health-horizon-dashboard/
rm -rf _tmp-scaffold
cd shell-health-horizon-dashboard
```

- [ ] **Step 2: Verify dev server boots**

Run: `npm run dev`
Expected: `▲ Next.js 15.x.x  - Local: http://localhost:3000`. Open URL → default page renders → kill server.

- [ ] **Step 3: Replace `next.config.mjs` with static-export config**

```js
const repo = 'shell-health-horizon-dashboard';
const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
```

- [ ] **Step 4: Verify production build emits `out/`**

Run: `npm run build && ls out/index.html`
Expected: `out/index.html` exists.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: bootstrap next.js with static export config"
```

### Task 0.2: Install runtime + dev dependencies

- [ ] **Step 1: Install runtime deps**

```bash
npm install \
  framer-motion@^11 \
  recharts@^2 \
  maplibre-gl@^4 \
  topojson-client@^3 \
  d3-geo@^3 \
  lucide-react@^0.460 \
  clsx@^2 \
  tailwind-merge@^2 \
  class-variance-authority@^0.7 \
  @radix-ui/react-dialog@^1 \
  @radix-ui/react-popover@^1 \
  @radix-ui/react-tabs@^1 \
  @radix-ui/react-tooltip@^1 \
  @radix-ui/react-select@^2 \
  @radix-ui/react-slot@^1 \
  cmdk@^1 \
  zustand@^5
```

- [ ] **Step 2: Install dev deps**

```bash
npm install -D \
  tsx@^4 \
  vitest@^2 \
  @vitest/ui@^2 \
  jsdom@^25 \
  @testing-library/react@^16 \
  @testing-library/jest-dom@^6 \
  @types/topojson-client@^3 \
  @types/d3-geo@^3
```

- [ ] **Step 3: Add npm scripts to `package.json`**

Replace the `"scripts"` block with:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "generate:data": "tsx scripts/generate-mock-data.ts"
}
```

- [ ] **Step 4: Add `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});
```

Create `tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Verify typecheck + test runner work**

Run: `npm run typecheck && npm test`
Expected: typecheck passes; vitest exits "No test files found" (acceptable — we'll add tests in Milestone 1).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add runtime, charting, map, motion, and test deps"
```

### Task 0.3: Self-host fonts

**Files:**
- Create: `public/fonts/Fraunces/Fraunces-VariableFont_SOFT,WONK,opsz,wght.ttf`
- Create: `public/fonts/Inter/Inter-VariableFont_opsz,wght.ttf`
- Create: `public/fonts/JetBrainsMono/JetBrainsMono-VariableFont_wght.ttf`
- Create: `app/fonts.ts`

- [ ] **Step 1: Download the variable fonts**

```bash
mkdir -p public/fonts/Fraunces public/fonts/Inter public/fonts/JetBrainsMono

curl -L -o public/fonts/Fraunces/Fraunces.ttf \
  "https://github.com/undercasetype/Fraunces/raw/main/fonts/variable/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf"

curl -L -o public/fonts/Inter/Inter.ttf \
  "https://github.com/rsms/inter/raw/master/docs/font-files/InterVariable.ttf"

curl -L -o public/fonts/JetBrainsMono/JetBrainsMono.ttf \
  "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/variable/JetBrainsMono%5Bwght%5D.ttf"
```

If any curl fails, fall back to Google Fonts static woff2: `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Inter:opsz,wght@14..32,300..700&family=JetBrains+Mono:wght@400;500;600&display=swap` and self-host the woff2 files it references.

- [ ] **Step 2: Create `app/fonts.ts`**

```ts
import localFont from 'next/font/local';

export const fraunces = localFont({
  src: '../public/fonts/Fraunces/Fraunces.ttf',
  variable: '--font-fraunces',
  display: 'swap',
});

export const inter = localFont({
  src: '../public/fonts/Inter/Inter.ttf',
  variable: '--font-inter',
  display: 'swap',
});

export const jetbrains = localFont({
  src: '../public/fonts/JetBrainsMono/JetBrainsMono.ttf',
  variable: '--font-jetbrains',
  display: 'swap',
});
```

- [ ] **Step 3: Wire fonts in `app/layout.tsx`**

Replace the existing `<html>` opening tag:

```tsx
import { fraunces, inter, jetbrains } from './fonts';

// inside RootLayout return:
<html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}>
```

- [ ] **Step 4: Verify build still passes**

Run: `npm run build`
Expected: build succeeds, fonts emitted under `out/_next/static/media/`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: self-host Fraunces, Inter, JetBrains Mono variable fonts"
```

---

## Milestone 1 — Types, Data Model, Mock Data Generator

### Task 1.1: Define core types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Write `lib/types.ts`**

```ts
export type AlertTier = 'watch' | 'attention' | 'action';
export type PPAPillar = 'promote' | 'protect' | 'access';
export type AgentId = 'infectious' | 'occupational' | 'regulatory' | 'climate' | 'psychosocial';
export type BusinessSegment = 'upstream' | 'integrated-gas' | 'downstream' | 'renewables';
export type Region = 'AMER' | 'EMEA' | 'APAC' | 'LATAM' | 'global';
export type Horizon = 'immediate' | '12mo' | '1-5yr';
export type Confidence = 'low' | 'moderate' | 'high';
export type SourceType = 'peer-reviewed' | 'who-alert' | 'regulatory' | 'industry' | 'environmental' | 'social';
export type ClimateZone = 'tropical' | 'arid' | 'temperate' | 'continental' | 'polar' | 'offshore';
export type HeadcountBand = '<100' | '100-500' | '500-2000' | '2000+';

export interface SourceCitation {
  type: SourceType;
  publisher: string;
  identifier: string;
  title: string;
  date: string;
  url?: string;
}

export interface EvidenceItem {
  date: string;
  agent: AgentId;
  event: string;
  detail: string;
}

export interface Signal {
  id: string;
  title: string;
  summary: string;
  tier: AlertTier;
  ppa: PPAPillar[];
  agent: AgentId;
  regions: Region[];
  affectedAssets: string[];
  affectedSegments: BusinessSegment[];
  horizon: Horizon;
  confidence: Confidence;
  firstDetected: string;
  lastUpdated: string;
  sources: SourceCitation[];
  triangulationCount: number;
  seamMapping: string[];
  recommendedAction: string;
  evidenceTrail: EvidenceItem[];
}

export interface ThematicDeepDive {
  theme: string;
  summary: string;
  signalIds: string[];
}

export interface BriefSignoff {
  name: string;
  role: string;
}

export interface Brief {
  id: string;
  quarter: string;
  publishedAt: string;
  abstract: string;
  keyFindings: string[];
  thematicDeepDives: ThematicDeepDive[];
  watchlistSignalIds: string[];
  signedOffBy: BriefSignoff[];
  pdfPath?: string;
}

export interface Asset {
  id: string;
  name: string;
  segment: BusinessSegment;
  region: Region;
  country: string;
  coords: [number, number];
  headcountBand: HeadcountBand;
  climateZone: ClimateZone;
}

export interface Agent {
  id: AgentId;
  name: string;
  scanningDomain: string;
  sourcesMonitored: string[];
  signalsOwned: number;
  lastRunAt: string;
}

export interface Meta {
  generatedAt: string;
  version: string;
  totals: { signals: number; briefs: number; assets: number; agents: number };
  uptimePct: number;
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: define core domain types for signals, briefs, assets, agents"
```

### Task 1.2: Author seed data — agents and assets

**Files:**
- Create: `scripts/seed/agents.seed.ts`
- Create: `scripts/seed/assets.seed.ts`

- [ ] **Step 1: Write `scripts/seed/agents.seed.ts`**

```ts
import type { Agent } from '@/lib/types';

export const AGENTS: Agent[] = [
  {
    id: 'infectious',
    name: 'Infectious Disease & Pandemic Preparedness',
    scanningDomain: 'Emerging pathogens, outbreak intelligence, IHR triggers, vaccine pipeline shifts',
    sourcesMonitored: ['PubMed', 'WHO DON', 'ECDC RRA', 'ProMED', 'GISAID', 'bioRxiv'],
    signalsOwned: 8,
    lastRunAt: '2026-04-30T22:14:00Z',
  },
  {
    id: 'occupational',
    name: 'Occupational Exposure & Cancer Epidemiology',
    scanningDomain: 'Petrochemical exposure science, IARC monographs, biomonitoring, cancer cluster signals',
    sourcesMonitored: ['PubMed', 'IARC', 'NIOSH', 'OSHA', 'IOGP', 'Embase'],
    signalsOwned: 8,
    lastRunAt: '2026-04-30T21:48:00Z',
  },
  {
    id: 'regulatory',
    name: 'Regulatory & Standards Evolution',
    scanningDomain: 'OSHA/NIOSH/HSE/EU-OSHA rulemaking, OEUK, IOGP, medical fitness regimes',
    sourcesMonitored: ['OSHA Reg Agenda', 'NIOSH', 'HSE', 'EU-OSHA', 'OEUK', 'IPIECA'],
    signalsOwned: 8,
    lastRunAt: '2026-04-30T20:02:00Z',
  },
  {
    id: 'climate',
    name: 'Climate–Health Interfaces',
    scanningDomain: 'Heat stress, vector range expansion, air quality, climate-driven mobility constraints',
    sourcesMonitored: ['Lancet Countdown', 'WMO', 'NOAA', 'Copernicus C3S', 'PubMed'],
    signalsOwned: 8,
    lastRunAt: '2026-04-30T22:02:00Z',
  },
  {
    id: 'psychosocial',
    name: 'Psychosocial Risk & Workforce Resilience',
    scanningDomain: 'Fatigue, mental health, ageing workforce, isolation, energy-transition stress',
    sourcesMonitored: ['ILO', 'WHO MHGap', 'PubMed', 'IOGP HSSE', 'NIOSH Total Worker Health'],
    signalsOwned: 8,
    lastRunAt: '2026-04-30T19:31:00Z',
  },
];
```

- [ ] **Step 2: Write `scripts/seed/assets.seed.ts`**

22 publicly-known Shell-operated facilities. Coordinates approximate.

```ts
import type { Asset } from '@/lib/types';

export const ASSETS: Asset[] = [
  { id: 'A-PERNIS', name: 'Pernis Refinery', segment: 'downstream', region: 'EMEA', country: 'Netherlands', coords: [4.40, 51.88], headcountBand: '2000+', climateZone: 'temperate' },
  { id: 'A-PEARL-GTL', name: 'Pearl GTL', segment: 'integrated-gas', region: 'EMEA', country: 'Qatar', coords: [51.55, 25.90], headcountBand: '2000+', climateZone: 'arid' },
  { id: 'A-PRELUDE', name: 'Prelude FLNG', segment: 'integrated-gas', region: 'APAC', country: 'Australia (offshore)', coords: [123.42, -13.78], headcountBand: '100-500', climateZone: 'offshore' },
  { id: 'A-QGC', name: 'QGC LNG', segment: 'integrated-gas', region: 'APAC', country: 'Australia', coords: [150.51, -27.16], headcountBand: '500-2000', climateZone: 'arid' },
  { id: 'A-BONGA', name: 'Bonga FPSO', segment: 'upstream', region: 'EMEA', country: 'Nigeria (offshore)', coords: [4.50, 4.45], headcountBand: '100-500', climateZone: 'offshore' },
  { id: 'A-NDA', name: 'Niger Delta Assets', segment: 'upstream', region: 'EMEA', country: 'Nigeria', coords: [6.30, 5.10], headcountBand: '500-2000', climateZone: 'tropical' },
  { id: 'A-PERMIAN', name: 'Permian Basin Operations', segment: 'upstream', region: 'AMER', country: 'United States', coords: [-102.55, 31.85], headcountBand: '500-2000', climateZone: 'arid' },
  { id: 'A-DEERPARK', name: 'Deer Park Manufacturing', segment: 'downstream', region: 'AMER', country: 'United States', coords: [-95.13, 29.70], headcountBand: '2000+', climateZone: 'tropical' },
  { id: 'A-NORCO', name: 'Norco Manufacturing', segment: 'downstream', region: 'AMER', country: 'United States', coords: [-90.41, 29.99], headcountBand: '2000+', climateZone: 'tropical' },
  { id: 'A-SCOTFORD', name: 'Scotford Complex', segment: 'downstream', region: 'AMER', country: 'Canada', coords: [-113.10, 53.71], headcountBand: '500-2000', climateZone: 'continental' },
  { id: 'A-MOERDIJK', name: 'Moerdijk Chemicals', segment: 'downstream', region: 'EMEA', country: 'Netherlands', coords: [4.62, 51.66], headcountBand: '500-2000', climateZone: 'temperate' },
  { id: 'A-RHEINLAND', name: 'Rheinland Refinery', segment: 'downstream', region: 'EMEA', country: 'Germany', coords: [6.85, 50.95], headcountBand: '2000+', climateZone: 'temperate' },
  { id: 'A-BUKOM', name: 'Bukom Manufacturing Site', segment: 'downstream', region: 'APAC', country: 'Singapore', coords: [103.78, 1.23], headcountBand: '2000+', climateZone: 'tropical' },
  { id: 'A-NANHAI', name: 'CNOOC-Shell Nanhai Petrochemicals', segment: 'downstream', region: 'APAC', country: 'China', coords: [113.10, 22.55], headcountBand: '2000+', climateZone: 'tropical' },
  { id: 'A-GOM-AUGER', name: 'Auger TLP', segment: 'upstream', region: 'AMER', country: 'United States (offshore)', coords: [-92.43, 27.55], headcountBand: '<100', climateZone: 'offshore' },
  { id: 'A-GOM-PERDIDO', name: 'Perdido Spar', segment: 'upstream', region: 'AMER', country: 'United States (offshore)', coords: [-94.90, 26.13], headcountBand: '<100', climateZone: 'offshore' },
  { id: 'A-NS-NELSON', name: 'Nelson Platform', segment: 'upstream', region: 'EMEA', country: 'United Kingdom (offshore)', coords: [1.92, 56.91], headcountBand: '100-500', climateZone: 'offshore' },
  { id: 'A-NS-SHEARWATER', name: 'Shearwater Platform', segment: 'upstream', region: 'EMEA', country: 'United Kingdom (offshore)', coords: [1.85, 57.50], headcountBand: '100-500', climateZone: 'offshore' },
  { id: 'A-VITO', name: 'Vito FPS', segment: 'upstream', region: 'AMER', country: 'United States (offshore)', coords: [-89.10, 28.80], headcountBand: '<100', climateZone: 'offshore' },
  { id: 'A-ETC-AMS', name: 'Energy Transition Campus Amsterdam', segment: 'renewables', region: 'EMEA', country: 'Netherlands', coords: [4.93, 52.39], headcountBand: '500-2000', climateZone: 'temperate' },
  { id: 'A-RBR', name: 'Rotterdam Biofuels Refinery', segment: 'renewables', region: 'EMEA', country: 'Netherlands', coords: [4.30, 51.95], headcountBand: '500-2000', climateZone: 'temperate' },
  { id: 'A-HOL-HYD', name: 'Holland Hydrogen 1', segment: 'renewables', region: 'EMEA', country: 'Netherlands', coords: [4.07, 51.97], headcountBand: '100-500', climateZone: 'temperate' },
];
```

- [ ] **Step 3: Commit**

```bash
git add scripts/seed/agents.seed.ts scripts/seed/assets.seed.ts
git commit -m "feat: add agent and asset seed data"
```

### Task 1.3: Author seed data — signals (40 signals across 5 agents)

**Files:**
- Create: `scripts/seed/signals.seed.ts`

This is the longest seed file. Each signal needs 6+ source citations and a 4–6 step evidence trail. Author 8 per agent, real-event-grounded.

- [ ] **Step 1: Write `scripts/seed/signals.seed.ts`**

The file is too long to inline here in full. Use this template per signal and produce 40 entries following the distribution below. **Do not abbreviate** — every signal must include all fields.

Distribution:
- **Infectious (8):** Mpox clade Ib expansion (Action), H5N1 mammalian spillover (Attention), Marburg Rwanda follow-on (Watch), Carbapenem-resistant Acinetobacter India ICUs (Attention), Polio cVDPV2 Yemen (Watch), Lassa fever Nigeria seasonality shift (Watch), Dengue serotype-3 SE Asia surge (Attention), Measles resurgence Europe (Watch).
- **Occupational (8):** Benzene biomonitoring revisions (Attention), PFAS firefighting foam phase-out audit (Action), Diesel exhaust IARC re-evaluation (Watch), Crystalline silica downstream (Attention), Hydrogen embrittlement worker exposure (Watch), Asbestos legacy assessment (Watch), Mercury offshore decommissioning (Attention), Naturally Occurring Radioactive Material (Watch).
- **Regulatory (8):** NIOSH heat-stress NPRM (Action), OEUK medical fitness 2026 update (Attention), HSE offshore certification revisions (Watch), EU-OSHA psychosocial directive draft (Attention), OSHA hazard communication GHS rev 9 (Watch), CDC respirator standard ASTM F3502 update (Watch), IOGP report 472 revision (Watch), Aviation EASA medical class 1 revisions (Attention).
- **Climate (8):** WBGT thresholds Permian summer 2026 (Action), Vector-borne range expansion North Sea (Watch), Air-quality wildfire smoke Pacific NW (Attention), Cyclone medevac corridor APAC (Attention), Cold stress arctic operations (Watch), Sea-level coastal asset HIA (Watch), Drought psychosocial impact Australian operations (Watch), Climate–AMR co-occurrence model (Watch).
- **Psychosocial (8):** Ageing offshore workforce capability gap (Attention), Energy-transition workforce identity stress (Watch), Fatigue model recalibration 14/14 rotations (Attention), Lone worker mental health pilot (Watch), Cumulative trauma exposure post-incident (Watch), Substance use post-pandemic (Watch), Suicide cluster surveillance NA upstream (Action), Burnout in HSSE leadership (Watch).

Template:

```ts
{
  id: 'SIG-2026-Q2-001',
  title: 'Mpox clade Ib sustained transmission across Central African Republic and Burundi',
  summary: 'WHO has reported continued geographic expansion of clade Ib human-to-human transmission with confirmed cases now in 6 non-endemic countries; Shell rotational workforce in Niger Delta and Bonga FPSO transit corridors at material exposure risk.',
  tier: 'action',
  ppa: ['protect', 'access'],
  agent: 'infectious',
  regions: ['EMEA', 'global'],
  affectedAssets: ['A-NDA', 'A-BONGA'],
  affectedSegments: ['upstream'],
  horizon: 'immediate',
  confidence: 'high',
  firstDetected: '2026-02-14',
  lastUpdated: '2026-04-28',
  sources: [
    { type: 'who-alert', publisher: 'WHO DON', identifier: 'DON-2026-04-23-MPX', title: 'Mpox clade Ib — Central and East Africa update', date: '2026-04-23', url: 'https://www.who.int/emergencies/disease-outbreak-news' },
    { type: 'peer-reviewed', publisher: 'PubMed', identifier: 'PMID:38912210', title: 'Genomic surveillance of MPXV clade Ib in cross-border transmission clusters', date: '2026-03-12' },
    { type: 'peer-reviewed', publisher: 'bioRxiv', identifier: '2026.03.04.583012', title: 'Sustained human-to-human transmission of MPXV clade Ib', date: '2026-03-04' },
    { type: 'regulatory', publisher: 'ECDC', identifier: 'RRA-2026-MPX-04', title: 'Rapid Risk Assessment: Mpox clade Ib expansion', date: '2026-04-09' },
    { type: 'industry', publisher: 'IPIECA', identifier: 'IPIECA-HSE-2026-03', title: 'Pandemic preparedness guidance for upstream rotational workforces', date: '2026-04-15' },
    { type: 'social', publisher: 'ProMED', identifier: 'ProMED-20260418', title: 'Mpox — Africa (43): expanded geographic footprint', date: '2026-04-18' },
  ],
  triangulationCount: 6,
  seamMapping: ['MHMS-09 Communicable Disease Control', 'MHMS-12 Medical Emergency Response'],
  recommendedAction: 'Activate tier-2 medevac protocol for Niger Delta rotations; brief HSSE leadership on PPE stockpile adequacy and contractor screening within 72 hours.',
  evidenceTrail: [
    { date: '2026-02-14', agent: 'infectious', event: 'NLP detection', detail: 'Pattern match on cross-border clade Ib clusters in PubMed + ProMED feeds' },
    { date: '2026-02-21', agent: 'infectious', event: 'Expert validation', detail: 'Lead infectious disease physician confirmed signal materiality' },
    { date: '2026-03-15', agent: 'infectious', event: 'Triangulation', detail: 'WHO DON corroborated independent of bioRxiv preprint' },
    { date: '2026-04-09', agent: 'infectious', event: 'Tier escalation', detail: 'Watch → Attention following ECDC RRA' },
    { date: '2026-04-23', agent: 'infectious', event: 'Tier escalation', detail: 'Attention → Action: 6th non-endemic country confirmed' },
  ],
}
```

Produce all 40 entries with distinct IDs `SIG-2026-Q2-001` through `SIG-2026-Q2-040`. Vary `tier`, `ppa`, `regions`, `affectedAssets`, `confidence`, dates within Q2 2026, and source counts (3–8 per signal).

Tier distribution target: **2 Action, 8 Attention, 30 Watch.**

Export:

```ts
import type { Signal } from '@/lib/types';
export const SIGNALS: Signal[] = [ /* 40 entries */ ];
```

- [ ] **Step 2: Run typecheck on the seed file**

Run: `npm run typecheck`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed/signals.seed.ts
git commit -m "feat: add 40 real-event-grounded signal seeds across 5 agents"
```

### Task 1.4: Author seed data — briefs

**Files:**
- Create: `scripts/seed/briefs.seed.ts`

- [ ] **Step 1: Write `scripts/seed/briefs.seed.ts`**

```ts
import type { Brief } from '@/lib/types';

export const BRIEFS: Brief[] = [
  {
    id: 'BRIEF-2025-Q3',
    quarter: 'Q3 2025',
    publishedAt: '2025-09-30',
    abstract: 'Q3 2025 reflected an inflection in climate–health interfaces, with WBGT exceedances driving the first Action-tier signals on Permian summer operations, alongside a persistent Mpox watchlist now spanning two clades.',
    keyFindings: [
      'Climate-driven heat exposure emerged as the dominant Protect-pillar risk',
      'Mpox clade Ib watchlist re-classified to Attention',
      'NIOSH heat-stress NPRM moved to public comment phase',
      'Ageing offshore workforce capability gaps surfaced as cross-cutting Promote-pillar concern',
    ],
    thematicDeepDives: [
      { theme: 'Climate–Health: WBGT Thresholds in Onshore US Operations', summary: 'NIOSH-aligned WBGT exceedance modelling for Permian summer rotations.', signalIds: ['SIG-2026-Q2-025'] },
      { theme: 'Infectious Disease: Mpox Clade Ib Geographic Expansion', summary: 'Cross-border clusters in Central/East Africa.', signalIds: ['SIG-2026-Q2-001'] },
    ],
    watchlistSignalIds: ['SIG-2026-Q2-001', 'SIG-2026-Q2-009', 'SIG-2026-Q2-025', 'SIG-2026-Q2-033'],
    signedOffBy: [{ name: 'Dr. A. Mwangi', role: 'Lead Expert, Infectious Disease' }, { name: 'Prof. L. van der Berg', role: 'Lead Expert, Occupational Exposure' }],
    pdfPath: '/briefs/2025-Q3.pdf',
  },
  {
    id: 'BRIEF-2025-Q4',
    quarter: 'Q4 2025',
    publishedAt: '2025-12-22',
    abstract: 'Q4 2025 was characterised by regulatory acceleration: NIOSH heat-stress NPRM advanced toward final rule, EU-OSHA tabled a draft psychosocial directive, and OEUK proposed material updates to medical fitness regimes affecting offshore mobilisation.',
    keyFindings: [
      'Three concurrent regulatory streams now converging on 2026 implementation windows',
      'PFAS firefighting foam phase-out audit triggered Action-tier review',
      'Marburg follow-on signals from Rwanda contained but watchlisted',
      'Cyclone medevac APAC corridor upgraded to Attention',
    ],
    thematicDeepDives: [
      { theme: 'Regulatory: NIOSH Heat-Stress NPRM Implementation Pathway', summary: 'Implications for Permian, QGC, and Pernis exterior maintenance.', signalIds: ['SIG-2026-Q2-017'] },
      { theme: 'Occupational Exposure: PFAS Firefighting Foam Phase-Out', summary: 'Cross-asset audit triggers and decommissioning exposure.', signalIds: ['SIG-2026-Q2-010'] },
    ],
    watchlistSignalIds: ['SIG-2026-Q2-010', 'SIG-2026-Q2-017', 'SIG-2026-Q2-018', 'SIG-2026-Q2-028'],
    signedOffBy: [{ name: 'Dr. A. Mwangi', role: 'Lead Expert, Infectious Disease' }, { name: 'Dr. K. Tanaka', role: 'Lead Expert, Regulatory & Standards' }],
    pdfPath: '/briefs/2025-Q4.pdf',
  },
  {
    id: 'BRIEF-2026-Q1',
    quarter: 'Q1 2026',
    publishedAt: '2026-03-31',
    abstract: 'Q1 2026 saw the Mpox watchlist escalate as cross-border clade Ib clusters expanded; concurrently a North America upstream suicide cluster signal triggered the first psychosocial Action-tier event of the programme.',
    keyFindings: [
      'Psychosocial domain produced its first Action-tier signal',
      'Mpox clade Ib formally tracked toward Action escalation',
      'Carbapenem-resistant Acinetobacter signals from India ICUs flagged for medevac protocol review',
      'EU CBAM occupational implications surfaced for Rotterdam cluster',
    ],
    thematicDeepDives: [
      { theme: 'Psychosocial: NA Upstream Cluster Surveillance', summary: 'Cluster surveillance methodology and intervention pathway.', signalIds: ['SIG-2026-Q2-039'] },
      { theme: 'AMR: Medevac Pathway Hospitals in High-Resistance Regions', summary: 'Triangulated PubMed and WHO data for revised medevac assumptions.', signalIds: ['SIG-2026-Q2-004'] },
    ],
    watchlistSignalIds: ['SIG-2026-Q2-001', 'SIG-2026-Q2-004', 'SIG-2026-Q2-039'],
    signedOffBy: [{ name: 'Prof. L. van der Berg', role: 'Lead Expert, Occupational Exposure' }, { name: 'Dr. M. Okonkwo', role: 'Lead Expert, Psychosocial' }],
    pdfPath: '/briefs/2026-Q1.pdf',
  },
  {
    id: 'BRIEF-2026-Q2',
    quarter: 'Q2 2026',
    publishedAt: '2026-04-30',
    abstract: 'Q2 2026 marks two concurrent Action-tier escalations — Mpox clade Ib and NIOSH heat-stress final rule pathway — with material implications for medevac assumptions, summer rotation planning, and Permian/QGC exterior maintenance schedules.',
    keyFindings: [
      'Two Action-tier escalations live concurrently for the first time',
      'Mpox clade Ib confirmed in 6 non-endemic countries',
      'NIOSH heat-stress final rule expected within 90 days',
      'Eight Attention-tier signals across Protect and Access pillars',
      'Triangulation discipline maintained — no single-source escalations issued',
    ],
    thematicDeepDives: [
      { theme: 'Infectious: Mpox Clade Ib — Cross-Border Transmission', summary: 'Six-country footprint, IPIECA pandemic preparedness alignment.', signalIds: ['SIG-2026-Q2-001'] },
      { theme: 'Climate: WBGT Exceedance Permian Summer 2026', summary: 'Pre-final-rule operational guidance for exterior maintenance.', signalIds: ['SIG-2026-Q2-025'] },
      { theme: 'Regulatory: NIOSH Heat-Stress Final Rule Pathway', summary: 'Timing, scope, and Shell readiness assessment.', signalIds: ['SIG-2026-Q2-017'] },
    ],
    watchlistSignalIds: ['SIG-2026-Q2-001', 'SIG-2026-Q2-002', 'SIG-2026-Q2-017', 'SIG-2026-Q2-025', 'SIG-2026-Q2-039'],
    signedOffBy: [{ name: 'Dr. A. Mwangi', role: 'Lead Expert, Infectious Disease' }, { name: 'Prof. L. van der Berg', role: 'Lead Expert, Occupational Exposure' }, { name: 'Dr. K. Tanaka', role: 'Lead Expert, Regulatory & Standards' }, { name: 'Dr. R. Patel', role: 'Lead Expert, Climate–Health' }, { name: 'Dr. M. Okonkwo', role: 'Lead Expert, Psychosocial' }],
    pdfPath: '/briefs/2026-Q2.pdf',
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add scripts/seed/briefs.seed.ts
git commit -m "feat: add 4 quarterly brief seeds (Q3 2025 - Q2 2026)"
```

### Task 1.5: Generate-mock-data script + tests

**Files:**
- Create: `scripts/generate-mock-data.ts`
- Create: `tests/generate-mock-data.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Verify the test fails**

Run: `npm test -- generate-mock-data`
Expected: FAIL — `public/data/` does not exist.

- [ ] **Step 3: Write `scripts/generate-mock-data.ts`**

```ts
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
```

- [ ] **Step 4: Run generator**

Run: `npm run generate:data`
Expected: 5 files written to `public/data/`.

- [ ] **Step 5: Run the test**

Run: `npm test -- generate-mock-data`
Expected: all 6 assertions pass.

- [ ] **Step 6: Stub print-ready PDFs**

```bash
mkdir -p public/briefs
for q in 2025-Q3 2025-Q4 2026-Q1 2026-Q2; do
  printf "%%PDF-1.4\n%%placeholder for $q brief\n%%EOF\n" > "public/briefs/$q.pdf"
done
```

- [ ] **Step 7: Commit**

```bash
git add scripts/generate-mock-data.ts tests/generate-mock-data.test.ts public/data public/briefs
git commit -m "feat: mock data generator + integrity tests + stub brief PDFs"
```

### Task 1.6: Data loaders + filter logic with tests

**Files:**
- Create: `lib/data.ts`
- Create: `lib/filters.ts`
- Create: `lib/format.ts`
- Create: `tests/data.test.ts`
- Create: `tests/filters.test.ts`

- [ ] **Step 1: Write data-loader tests**

```ts
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
```

- [ ] **Step 2: Write filter tests**

```ts
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
```

- [ ] **Step 3: Verify tests fail**

Run: `npm test -- data filters`
Expected: FAIL — modules not found.

- [ ] **Step 4: Write `lib/data.ts`**

```ts
import type { Signal, Brief, Asset, Agent, Meta } from './types';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

async function fetchJSON<T>(name: string): Promise<T> {
  if (typeof window === 'undefined') {
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
```

- [ ] **Step 5: Write `lib/filters.ts`**

```ts
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
```

- [ ] **Step 6: Write `lib/format.ts`**

```ts
export const fmtRelative = (iso: string): string => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
};

export const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });

export const fmtNumber = (n: number): string => n.toLocaleString('en-US');
```

- [ ] **Step 7: Run tests**

Run: `npm test`
Expected: all data/filter/generator tests pass.

- [ ] **Step 8: Commit**

```bash
git add lib/data.ts lib/filters.ts lib/format.ts tests/data.test.ts tests/filters.test.ts
git commit -m "feat: data loaders, filter logic with URL state, format helpers"
```

---

## Milestone 2 — Theme System

### Task 2.1: CSS variables for both themes in `app/globals.css`

**Files:**
- Modify: `app/globals.css` (full rewrite)

- [ ] **Step 1: Replace `app/globals.css`**

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-fraunces), ui-serif, Georgia, serif;
  --font-mono: var(--font-jetbrains), ui-monospace, monospace;
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-panel: var(--panel);
  --color-border: var(--border);
  --color-ink: var(--ink);
  --color-ink-secondary: var(--ink-secondary);
  --color-ink-tertiary: var(--ink-tertiary);
  --color-tier-watch: var(--tier-watch);
  --color-tier-attention: var(--tier-attention);
  --color-tier-action: var(--tier-action);
  --color-ppa-promote: var(--ppa-promote);
  --color-ppa-protect: var(--ppa-protect);
  --color-ppa-access: var(--ppa-access);
}

:root, [data-theme="editorial"] {
  --bg: #FAFAF7;
  --surface: #FFFFFF;
  --panel: #F5F4EE;
  --border: #E6E4DD;
  --ink: #0E1116;
  --ink-secondary: #4A4F58;
  --ink-tertiary: #8B8F96;
  --tier-watch: #3A6EA5;
  --tier-attention: #C9821B;
  --tier-action: #B23A3A;
  --ppa-promote: #5B8466;
  --ppa-protect: #5E5A8A;
  --ppa-access: #A85C3E;
  --display-family: var(--font-fraunces);
}

[data-theme="ops"] {
  --bg: #0A0D12;
  --surface: #10141B;
  --panel: #161B23;
  --border: #222833;
  --ink: #E6EAF2;
  --ink-secondary: #9AA3B2;
  --ink-tertiary: #5C6573;
  --tier-watch: #5B8FCB;
  --tier-attention: #E5A23F;
  --tier-action: #E25C5C;
  --ppa-promote: #7FB58E;
  --ppa-protect: #8B86C4;
  --ppa-access: #D08465;
  --display-family: var(--font-inter);
}

html, body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  font-feature-settings: "ss01", "cv11";
}

.font-display { font-family: var(--display-family); font-variation-settings: "opsz" 96; }
.font-mono { font-family: var(--font-mono); }

/* hairline border helper */
.border-hair { border-color: var(--border); }

/* ops grid overlay */
[data-theme="ops"] .ops-grid {
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 32px 32px;
}

/* focus rings (both themes) */
:where(button, a, input, select, textarea, [role="button"], [role="tab"]):focus-visible {
  outline: 2px solid var(--tier-watch);
  outline-offset: 2px;
  border-radius: 4px;
}
```

- [ ] **Step 2: Wire `data-theme` in `app/layout.tsx`**

Replace contents:

```tsx
import type { Metadata } from 'next';
import { fraunces, inter, jetbrains } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shell Health Horizon — Executive Intelligence',
  description: 'Illustrative prototype dashboard for the Shell Health Horizon Scanning programme.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="editorial"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('shh-theme');if(t==='ops'||t==='editorial')document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Smoke check**

Run: `npm run dev` → open localhost → in DevTools console: `document.documentElement.dataset.theme = 'ops'` — verify the body background goes near-black. Set back to `editorial`. Kill server.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: dual-theme CSS variables (editorial + ops)"
```

### Task 2.2: ThemeToggle component + useTheme hook

**Files:**
- Create: `lib/theme.ts`
- Create: `components/nav/ThemeToggle.tsx`

- [ ] **Step 1: Write `lib/theme.ts`**

```ts
'use client';
import { useEffect, useState } from 'react';

export type Theme = 'editorial' | 'ops';
const KEY = 'shh-theme';

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>('editorial');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem(KEY)) as Theme | null;
    if (saved === 'editorial' || saved === 'ops') setThemeState(saved);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    localStorage.setItem(KEY, t);
  };

  return [theme, setTheme];
}
```

- [ ] **Step 2: Write `components/nav/ThemeToggle.tsx`**

```tsx
'use client';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const next = theme === 'editorial' ? 'ops' : 'editorial';
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} theme`}
      onClick={() => setTheme(next)}
      className="inline-flex items-center gap-2 rounded-md border border-hair px-3 py-1.5 text-xs font-mono uppercase tracking-wider hover:bg-[var(--panel)] transition-colors"
    >
      {theme === 'editorial' ? <Moon size={14} /> : <Sun size={14} />}
      <span>{theme === 'editorial' ? 'Ops' : 'Editorial'}</span>
    </button>
  );
}
```

- [ ] **Step 3: Smoke check + commit**

Render the toggle in `app/page.tsx` temporarily; click it; verify theme flips and persists across reload. Remove the temporary mount.

```bash
git add lib/theme.ts components/nav/ThemeToggle.tsx
git commit -m "feat: theme toggle with localStorage persistence"
```

---

## Milestone 3 — Shared Primitives

### Task 3.1: Tier, PPA, Agent, Confidence, SourceType primitives

**Files:**
- Create: `components/shared/TierBadge.tsx`
- Create: `components/shared/PpaChip.tsx`
- Create: `components/shared/AgentIcon.tsx`
- Create: `components/shared/ConfidenceMeter.tsx`
- Create: `components/shared/SourceTypeIcon.tsx`
- Create: `components/shared/Sparkline.tsx`
- Create: `lib/cn.ts`

- [ ] **Step 1: Write `lib/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

- [ ] **Step 2: Write `components/shared/TierBadge.tsx`**

```tsx
import { cn } from '@/lib/cn';
import type { AlertTier } from '@/lib/types';

const STYLE: Record<AlertTier, { bg: string; ink: string; label: string }> = {
  watch: { bg: 'bg-[var(--tier-watch)]', ink: 'text-white', label: 'Watch' },
  attention: { bg: 'bg-[var(--tier-attention)]', ink: 'text-white', label: 'Attention' },
  action: { bg: 'bg-[var(--tier-action)]', ink: 'text-white', label: 'Action' },
};

export function TierBadge({ tier, size = 'md' }: { tier: AlertTier; size?: 'sm' | 'md' }) {
  const s = STYLE[tier];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-mono uppercase tracking-wider',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        s.bg, s.ink,
      )}
    >
      <span className="size-1.5 rounded-full bg-white/80" />
      {s.label}
    </span>
  );
}

export function TierDot({ tier, pulse = false }: { tier: AlertTier; pulse?: boolean }) {
  return (
    <span className="relative inline-flex">
      <span className={cn('size-2.5 rounded-full', STYLE[tier].bg)} />
      {pulse && tier === 'action' && (
        <span className={cn('absolute inset-0 size-2.5 rounded-full animate-ping', STYLE[tier].bg, 'opacity-60')} />
      )}
    </span>
  );
}
```

- [ ] **Step 3: Write `components/shared/PpaChip.tsx`**

```tsx
import { cn } from '@/lib/cn';
import type { PPAPillar } from '@/lib/types';

const STYLE: Record<PPAPillar, { fg: string; ring: string; label: string }> = {
  promote: { fg: 'text-[var(--ppa-promote)]', ring: 'ring-[var(--ppa-promote)]/30', label: 'Promote' },
  protect: { fg: 'text-[var(--ppa-protect)]', ring: 'ring-[var(--ppa-protect)]/30', label: 'Protect' },
  access: { fg: 'text-[var(--ppa-access)]', ring: 'ring-[var(--ppa-access)]/30', label: 'Access' },
};

export function PpaChip({ pillar }: { pillar: PPAPillar }) {
  const s = STYLE[pillar];
  return (
    <span className={cn('inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ring-1', s.fg, s.ring)}>
      {s.label}
    </span>
  );
}
```

- [ ] **Step 4: Write `components/shared/AgentIcon.tsx`**

```tsx
import { Bug, FlaskConical, Scale, ThermometerSun, Brain } from 'lucide-react';
import type { AgentId } from '@/lib/types';

const MAP = {
  infectious: Bug,
  occupational: FlaskConical,
  regulatory: Scale,
  climate: ThermometerSun,
  psychosocial: Brain,
} as const;

export const AGENT_LABEL: Record<AgentId, string> = {
  infectious: 'Infectious Disease',
  occupational: 'Occupational Exposure',
  regulatory: 'Regulatory & Standards',
  climate: 'Climate–Health',
  psychosocial: 'Psychosocial Risk',
};

export function AgentIcon({ id, size = 16 }: { id: AgentId; size?: number }) {
  const Icon = MAP[id];
  return <Icon size={size} aria-label={AGENT_LABEL[id]} />;
}
```

- [ ] **Step 5: Write `components/shared/ConfidenceMeter.tsx`**

```tsx
import { cn } from '@/lib/cn';
import type { Confidence } from '@/lib/types';

const LEVELS: Confidence[] = ['low', 'moderate', 'high'];

export function ConfidenceMeter({ value }: { value: Confidence }) {
  const filled = LEVELS.indexOf(value) + 1;
  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn('h-3 w-1 rounded-sm', i <= filled ? 'bg-[var(--ink)]' : 'bg-[var(--border)]')} />
        ))}
      </div>
      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-secondary)]">{value}</span>
    </div>
  );
}
```

- [ ] **Step 6: Write `components/shared/SourceTypeIcon.tsx`**

```tsx
import { BookOpen, Globe, FileText, Building2, CloudSun, MessageCircle } from 'lucide-react';
import type { SourceType } from '@/lib/types';

const MAP = {
  'peer-reviewed': BookOpen,
  'who-alert': Globe,
  'regulatory': FileText,
  'industry': Building2,
  'environmental': CloudSun,
  'social': MessageCircle,
} as const;

export function SourceTypeIcon({ type, size = 14 }: { type: SourceType; size?: number }) {
  const Icon = MAP[type];
  return <Icon size={size} />;
}
```

- [ ] **Step 7: Write `components/shared/Sparkline.tsx`**

```tsx
'use client';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export function Sparkline({ data, color = 'var(--ink)' }: { data: number[]; color?: string }) {
  const series = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={28}>
      <LineChart data={series}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 8: Verify typecheck and commit**

Run: `npm run typecheck`
Expected: pass.

```bash
git add lib/cn.ts components/shared
git commit -m "feat: shared primitives (TierBadge, PpaChip, AgentIcon, ConfidenceMeter, SourceTypeIcon, Sparkline)"
```

---

## Milestone 4 — Layout Chrome (SideRail, GlobalFilters, Footer)

### Task 4.1: SideRail navigation

**Files:**
- Create: `components/nav/SideRail.tsx`

- [ ] **Step 1: Write the file**

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListFilter, Map, BookText, Activity } from 'lucide-react';
import { cn } from '@/lib/cn';

const ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/signals', label: 'Signals', icon: ListFilter },
  { href: '/map', label: 'Geographic', icon: Map },
  { href: '/briefs', label: 'Briefs', icon: BookText },
];

export function SideRail() {
  const path = usePathname();
  return (
    <nav className="fixed left-0 top-0 z-30 flex h-screen w-[180px] flex-col border-r border-hair bg-[var(--surface)]">
      <div className="flex items-center gap-2 px-5 py-5">
        <Activity size={18} className="text-[var(--tier-action)]" />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink-secondary)]">SHH</span>
      </div>
      <ul className="flex flex-col gap-1 px-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-[var(--panel)] text-[var(--ink)]'
                    : 'text-[var(--ink-secondary)] hover:bg-[var(--panel)] hover:text-[var(--ink)]',
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto px-5 py-5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-tertiary)]">
        v0.1 · prototype
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/nav/SideRail.tsx
git commit -m "feat: side rail navigation with active state"
```

### Task 4.2: GlobalFilters (URL-synced) + Footer

**Files:**
- Create: `components/nav/GlobalFilters.tsx`
- Create: `components/nav/Footer.tsx`

- [ ] **Step 1: Write `components/nav/GlobalFilters.tsx`**

```tsx
'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { parseFilterParams, serializeFilters } from '@/lib/filters';
import type { PPAPillar, Horizon } from '@/lib/types';
import { cn } from '@/lib/cn';

const PPA_OPTIONS: { id: PPAPillar; label: string }[] = [
  { id: 'promote', label: 'Promote' },
  { id: 'protect', label: 'Protect' },
  { id: 'access', label: 'Access' },
];
const HORIZON_OPTIONS: { id: Horizon; label: string }[] = [
  { id: 'immediate', label: '≤90d' },
  { id: '12mo', label: '12mo' },
  { id: '1-5yr', label: '1-5yr' },
];

export function GlobalFilters() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const filters = parseFilterParams(new URLSearchParams(params.toString()));

  const togglePpa = (p: PPAPillar) => {
    const cur = new Set(filters.ppas ?? []);
    cur.has(p) ? cur.delete(p) : cur.add(p);
    push({ ...filters, ppas: Array.from(cur) });
  };
  const toggleHorizon = (h: Horizon) => {
    const cur = new Set(filters.horizons ?? []);
    cur.has(h) ? cur.delete(h) : cur.add(h);
    push({ ...filters, horizons: Array.from(cur) });
  };
  const push = (next: ReturnType<typeof parseFilterParams>) => {
    const qs = serializeFilters(next);
    router.push(qs ? `${path}?${qs}` : path);
  };

  return (
    <div className="fixed right-6 top-4 z-30 flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-md border border-hair bg-[var(--surface)] p-1">
        {PPA_OPTIONS.map((p) => {
          const on = filters.ppas?.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => togglePpa(p.id)}
              className={cn(
                'rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider',
                on ? `bg-[var(--ppa-${p.id})] text-white` : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]',
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-1 rounded-md border border-hair bg-[var(--surface)] p-1">
        {HORIZON_OPTIONS.map((h) => {
          const on = filters.horizons?.includes(h.id);
          return (
            <button
              key={h.id}
              onClick={() => toggleHorizon(h.id)}
              className={cn(
                'rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider',
                on ? 'bg-[var(--ink)] text-[var(--bg)]' : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]',
              )}
            >
              {h.label}
            </button>
          );
        })}
      </div>
      <ThemeToggle />
    </div>
  );
}
```

- [ ] **Step 2: Write `components/nav/Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="border-t border-hair bg-[var(--surface)] px-8 py-5 text-[11px] text-[var(--ink-tertiary)]">
      <p className="font-mono uppercase tracking-wider">
        Illustrative prototype — signals are real-event-grounded but not vendor-validated. No Shell-specific operational data. Shell Pecten not displayed.
      </p>
    </footer>
  );
}
```

- [ ] **Step 3: Wire chrome into root layout**

Modify `app/layout.tsx` body:

```tsx
<body>
  <SideRail />
  <GlobalFilters />
  <main className="ml-[180px] min-h-screen">{children}</main>
  <Footer />
</body>
```

Add the imports at the top.

- [ ] **Step 4: Smoke check + commit**

`npm run dev` → confirm the rail, the right-side filter cluster, and the footer appear on `/`. Kill server.

```bash
git add components/nav/GlobalFilters.tsx components/nav/Footer.tsx app/layout.tsx
git commit -m "feat: global filters bar (PPA, horizon, theme) + footer disclaimer"
```

---

## Milestones 5–9 — Views

> The remaining milestones implement the five views. Each follows the same pattern: server component fetches data via `loadAll()`, passes to client components, layout matches spec §7.x. Code blocks are abbreviated for top-level structure; **fill in component bodies following the spec and primitives already built in M0–M4**. When in doubt, mirror the data shapes from `lib/types.ts`. Every interactive piece must have visible focus rings and aria labels.

### Task 5.1: Dashboard `/` — assemble bands

**Files:** `app/page.tsx`, `components/dashboard/{HeroTicker,KpiStrip,PpaBalance,AgentGrid,SnapshotMap,SignalFeed}.tsx`

- [ ] Write `app/page.tsx` as an async server component that calls `loadAll()` and renders six children: `<HeroTicker signals={...}/>`, `<KpiStrip meta={...} signals={...}/>`, a flex row with `<PpaBalance/>` + `<AgentGrid agents={...}/>`, `<SnapshotMap assets={...} signals={...}/>`, `<SignalFeed signals={...}/>`. Each child is a client component when it uses motion/state.
- [ ] Implement HeroTicker with Framer Motion AnimatePresence rotating every 7s; pause on hover; show signals where tier is action/attention sorted by lastUpdated desc; headline above with `font-display`.
- [ ] Implement KpiStrip with 5 tiles + Sparkline; numbers in font-mono; layout `grid-cols-5 gap-4`.
- [ ] Implement PpaBalance using Recharts BarChart with stacked tier breakdown per PPA pillar; click handler pushes to `/signals?ppa=...`.
- [ ] Implement AgentGrid as a 5-up grid of cards (name, AgentIcon, signalsOwned, lastRunAt via fmtRelative, mini activity pulse); click → `/signals?agent=...`.
- [ ] Implement SnapshotMap using a static SVG world (use `world-110m.json` topojson + d3-geo's geoNaturalEarth1 projection rendered as SVG paths — no MapLibre on the dashboard for performance); render asset dots and a soft radial gradient per region weighted by signal count.
- [ ] Implement SignalFeed as a vertical list of 8 most recently updated signals; each row is a Next Link to `/signals/[id]` with TierDot, title, AgentIcon, region chips, ConfidenceMeter, fmtRelative.
- [ ] Smoke test: `npm run dev`, visit `/`, verify all bands render, no console errors.
- [ ] Commit: `feat: dashboard view with hero ticker, KPI strip, PPA balance, agent grid, snapshot map, signal feed`.

### Task 5.2: Quality gate

- [ ] `npm run typecheck && npm run lint && npm test && npm run build` all green.
- [ ] Commit any fixes: `chore: fix lint/typecheck on dashboard`.

### Task 6.1: Signal Explorer `/signals`

**Files:** `app/signals/page.tsx`, `components/signals/{FacetRail,SignalsTable,SignalsCardGrid,SignalsTimeline,QuickPeek}.tsx`

- [ ] Implement `app/signals/page.tsx` as a client component that loads signals once and reads `useSearchParams()` for filter state. Layout: 240px FacetRail on the left, view-toggle toolbar at top, table/grid/timeline below. Selected signal previewed in QuickPeek panel on hover.
- [ ] FacetRail: each facet section uses a `<details>`/checkbox group; result count next to each option computed by applying the rest of the filters minus the current facet (so counts reflect "if I add this filter, X signals remain").
- [ ] SignalsTable: native HTML table with sticky header, sortable columns (click header → toggle asc/desc on a `sort` URL param), alternating row tint via `:nth-child(even)`. Row click → push `/signals/[id]`. Row mouseenter (with 250ms debounce) → set selected signal in parent for QuickPeek.
- [ ] SignalsCardGrid: `grid-cols-3 gap-4`, each card with TierBadge, title, summary clamp-3, AgentIcon row, region chips, confidence meter, "View →" link.
- [ ] SignalsTimeline: horizontal axis spanning min(firstDetected) to max(lastUpdated); each signal a horizontal bar with TierDot at end; grouped by agent in 5 swim lanes.
- [ ] QuickPeek: right-side fixed 320px panel with summary, recommended action, sources count, "Open detail" CTA.
- [ ] Cmd-K palette via `cmdk` package: search across signal titles + IDs, jump to detail.
- [ ] Export-CSV button serializes the current filtered view to CSV via Blob URL.
- [ ] Commit: `feat: signal explorer with facet filtering, table/card/timeline views, QuickPeek, Cmd-K`.

### Task 7.1: Signal Detail `/signals/[id]`

**Files:** `app/signals/[id]/page.tsx`, `components/signal-detail/{EvidenceTrail,SourceCitations,TriangulationDiagram,AffectedAssets,SidePanel}.tsx`

- [ ] Implement `generateStaticParams` to return all 40 signal IDs so the static export emits each detail page.
- [ ] Server component loads `loadSignals()`, finds matching signal, throws notFound if missing.
- [ ] Sticky header: back link, ID in mono, title in `font-display` 40px, TierBadge, PpaChips, "Action by" computed as firstDetected + 3 days for action tier.
- [ ] Main column 2/3: summary as italic pull-quote; recommendedAction in a bordered call-out with SEAM mapping listed beneath; EvidenceTrail vertical timeline with date / agent icon / event label / detail; SourceCitations grouped by type with SourceTypeIcon and external links; TriangulationDiagram as a small SVG showing source-type nodes connected to a center "Signal" node; AffectedAssets inline SVG regional map zoomed to signal regions.
- [ ] Side column 1/3: ConfidenceMeter with rationale text; agent provenance card; SEAM mapping list; PPA implications (one bullet per pillar in `s.ppa`); 3 related signals (same agent, distinct ID).
- [ ] Commit: `feat: signal detail page with evidence trail, source citations, triangulation diagram, affected assets`.

### Task 8.1: Geographic View `/map`

**Files:** `app/map/page.tsx`, `components/map/{WorldMap,SignalSheet,TimeScrubber,LayerToggles}.tsx`

- [ ] `app/map/page.tsx` is a client component; loads data; renders a full-bleed `<WorldMap>` with `<LayerToggles>` (Asset dots, Signal density heatmap, Climate zones, Regulatory jurisdictions), bottom `<TimeScrubber>`, left collapsible filter panel reusing facets from M6.
- [ ] WorldMap uses MapLibre GL with a custom inline style. Editorial style: pastel land `#EDEAE2`, water `#FAFAF7`, borders `#D4D0C5`. Ops style: land `#10141B`, water `#0A0D12`, borders `#222833` with 1px amber graticule via overlay layer.
- [ ] Theme observer: subscribe to `data-theme` mutations and call `map.setStyle(themedStyle)`.
- [ ] Asset GeoJSON layer: circle radius based on headcountBand, color by segment via `match` expression (segment palette: upstream `#3D5A80`, integrated-gas `#5E5A8A`, downstream `#6E5C3D`, renewables `#5B8466`).
- [ ] Signal pins: GeoJSON points with each signal placed at the centroid of its first affected asset (or region centroid if no asset); circle color = tier color; pulse layer for action tier via animated `circle-radius` transitions on a 1.2s interval.
- [ ] Click on pin → `<SignalSheet>` (Radix Dialog as right-anchored sheet, 420px wide).
- [ ] TimeScrubber: slider from 90 days ago → today; signals filtered to those whose firstDetected ≤ scrubber date and lastUpdated ≥ scrubber date - 14d. Play button advances date at 4×/8×/16× speed.
- [ ] Commit: `feat: geographic map with MapLibre, asset/signal layers, time scrubber, signal sheet`.

### Task 9.1: Briefs Archive `/briefs`

**Files:** `app/briefs/page.tsx`, `components/briefs/{BriefCarousel,BriefReader,BriefMiniTOC}.tsx`

- [ ] `app/briefs/page.tsx`: client component, loads briefs + signals; carousel of 4 cards at top with Framer Motion layout; selected brief id in URL `?b=BRIEF-2026-Q2`; reader below.
- [ ] BriefCarousel: horizontal `flex gap-4 overflow-x-auto snap-x`; each card 340×460px tall; cover-style typography (quarter in font-display 64pt, abstract clamp-3, key-stat strip with signals scanned/action-tier/sources triangulated, signedOffBy initials in mono); current quarter card scaled 1.05× and ringed.
- [ ] BriefReader: max-width 720px column, font-display headings, structured sections — Executive Summary (abstract), Methodology Transparency Note (boilerplate text describing search protocols, AI tools, confidence ratings), Thematic Deep Dives (each linking out to signals), Watchlist Table, IOGP/IPIECA Benchmarking (boilerplate placeholder section). "Download print-ready PDF" button anchored to `pdfPath`.
- [ ] BriefMiniTOC: floating right-side rail with anchor links to each section; active section highlighted via IntersectionObserver.
- [ ] Commit: `feat: briefs archive with quarterly carousel, long-form reader, mini-TOC`.

---

## Milestone 10 — Deploy & Polish

### Task 10.1: GitHub Pages workflow

**Files:** `.github/workflows/deploy.yml`

- [ ] Write the workflow file:

```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run generate:data
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./out }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] Add `.nojekyll` to `public/`:

```bash
touch public/.nojekyll
```

- [ ] Commit: `ci: add GitHub Pages deploy workflow`.

### Task 10.2: README

**Files:** `README.md`

- [ ] Write the README:

```markdown
# Shell Health Horizon — Executive Intelligence (Prototype)

Illustrative prototype dashboard for the Shell Health Horizon Scanning RFI (Deliverable C).
**Disclaimer:** Real-event-grounded mock data. Not vendor-validated. Shell Pecten not displayed.

## Quickstart
```bash
npm install
npm run generate:data
npm run dev
```
Open http://localhost:3000.

## Build for production
```bash
npm run build
npx serve out
```

## Deploy to GitHub Pages
1. Push to `main` of a GitHub repo named `shell-health-horizon-dashboard`.
2. In Settings → Pages, set Source to "GitHub Actions".
3. The action publishes `out/` automatically.

## Configuring the repo name
The `repo` constant in `next.config.mjs` must match your GitHub repo name (powers `basePath`/`assetPrefix`). If you fork under a different name, update both.

## Stack
Next.js 15 (App Router, static export) · TypeScript strict · Tailwind v4 · shadcn/ui · Recharts · MapLibre GL · Framer Motion · Vitest.
```

- [ ] Commit: `docs: README with quickstart, build, deploy instructions`.

### Task 10.3: Quality gates

- [ ] Run `npm run typecheck` — must be clean.
- [ ] Run `npm run lint` — must be clean.
- [ ] Run `npm test` — all tests pass.
- [ ] Run `npm run build` — succeeds; `out/` exists.
- [ ] Run `npx serve out -l 5000` and click through `/`, `/signals`, `/signals/SIG-2026-Q2-001`, `/map`, `/briefs` — no console errors.
- [ ] Run Lighthouse desktop on each route — all four scores ≥ 90.
- [ ] Tab through every page using only keyboard — focus rings visible everywhere.
- [ ] Toggle theme on each route — persists; map restyles correctly.
- [ ] Commit any fixes: `chore: address quality-gate findings`.

### Task 10.4: Tag v0.1 and push

- [ ] `git tag -a v0.1.0 -m "RFI sample dashboard"`
- [ ] Push branch + tag to the GitHub repo to trigger first deploy.
- [ ] Verify the live URL `https://<user>.github.io/shell-health-horizon-dashboard/` renders all five routes.

---

## Self-review notes

**Spec coverage:** every spec section maps to tasks — IA (M4), visual system (M2), data model (M1), per-view designs (M5–9), build/deploy (M0, M10). Risks list addressed: basePath in next.config.mjs (M0), bundled topojson (M1.5 + M8), self-hosted fonts (M0.3), 40-signal volume (M1.3), graceful-degrade banner (covered implicitly via fixed widths; not a separate task — accept this gap).

**Placeholder scan:** "fill in component bodies following the spec" appears in M5–9 preamble. Justification: M5–9 each reference back to spec §7.x which has full per-view briefs, plus the primitives are exhaustively defined in M0–M4. The pattern of "loadAll → server component → typed children" is established in M5.1 and reused. Subsequent tasks list each component to build with explicit acceptance criteria. This is acceptable plan compression for a 3-day prototype; a stricter plan would inline each component's full code.

**Type consistency:** all types defined once in `lib/types.ts` (M1.1). Filter shape matches the global filter UI (M4.2) which matches the Signal Explorer facets (M6.1). Theme keys are `'editorial' | 'ops'` consistently. Signal IDs are `SIG-2026-Q2-NNN`. Brief IDs are `BRIEF-YYYY-QN`. Asset IDs are `A-NAME`.

**Acknowledged compression for time-pressure:** M5.1 + M6.1 + M7.1 + M8.1 + M9.1 are intentionally less granular than M0–M4 because the patterns are established and the spec has detailed per-view briefs. If executing via subagent-driven-development, expect each of those tasks to take a fresh subagent ~1–2 hours and produce 5–8 commits.
