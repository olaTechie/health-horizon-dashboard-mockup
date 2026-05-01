# Shell Health Horizon Scanning — Executive Intelligence Dashboard (Prototype)

**Date:** 2026-05-01
**Status:** Spec — approved through design phase, ready for implementation planning
**Context:** Prototype for an RFI response (Shell Health Horizon Scanning, RFI Submission Requirement #2: "methodology description + sample brief outline + sample dashboard"). RFI submission deadline: 2026-05-04.
**Disclaimer to bake into product:** Illustrative prototype. Signals are real-event-grounded but not vendor-validated. No Shell-specific operational data is used; Shell Pecten is not displayed (per RFI clause 3.d).

---

## 1. Purpose

Build a static, GitHub Pages-hostable web prototype that demonstrates the Executive Intelligence Dashboard described as Deliverable C in Shell's RFI:

> Live, continuously updated signal tracker; filterable by PPA pillar, geography, business segment, alert tier; geographic overlay mapped to Shell operational footprint; accessible to Shell Health, HSSE policy, and regional health leads.

The prototype must visibly embody the AI-Augmented Living Intelligence Architecture from the proposal (Layer 5: Executive Dashboard) — i.e., the surface where the agentic AI layer's output reaches Shell leadership.

## 2. Non-goals

- Real authentication or multi-user state
- Live data feeds (the prototype consumes static JSON, truthfully modelling "agent layer outputs a structured payload")
- Runtime PDF generation
- Sub-768px mobile redesign (graceful degradation only)
- E2E test suite

## 3. Architecture

- **Framework:** Next.js 15 App Router with `output: 'export'` for static hosting on GitHub Pages.
- **Language:** TypeScript, strict mode.
- **Styling:** Tailwind CSS v4 with CSS variables for theming.
- **UI primitives:** shadcn/ui copied into the repo (Button, Tabs, Sheet, Dialog, Command, Tooltip, Popover, Select).
- **Charts:** Recharts (time-series, bar, donut, sparkline).
- **Map:** MapLibre GL with `world-atlas` topojson — no API keys, fully static.
- **Motion:** Framer Motion for view transitions and signal-card entrance.
- **Data:** mock signals/briefs/assets/agents stored as static JSON in `/public/data/*.json`, fetched client-side.
- **Deploy:** GitHub Action publishing the `out/` build to Pages on push to `main`.

The architecture is deliberately backendless — the static JSON contract is the same shape the production agent layer would emit, so the prototype is a faithful preview.

## 4. Information Architecture

```
/                       Dashboard (executive overview)
/signals                Signal Explorer (filterable, sortable)
/signals/[id]           Signal Detail (evidence trail)
/map                    Geographic View (world map + Shell asset overlay)
/briefs                 Briefs Archive (quarterly briefs)
```

**Global chrome (every route):**
- Slim left rail: icon + label nav for the five views.
- Top-right: theme toggle (Editorial ⇄ Ops), global PPA pillar filter, global time-horizon picker.
- Global filters persist across routes via URL search params so deep links are shareable (e.g., "Protect, 12-month, EMEA").

## 5. Visual System

Two complete themes, both first-class. Toggled via `data-theme` on `<html>`. Persisted in `localStorage`. Same components, different CSS variables.

### 5.1 Editorial (light, default)

- Canvas `#FAFAF7`, surfaces `#FFFFFF`, borders `#E6E4DD`.
- Ink: primary `#0E1116`, secondary `#4A4F58`, tertiary `#8B8F96`.
- Display type: **Fraunces** variable serif (optical-sized) for H1/H2 and large numerals.
- Body / UI: **Inter** 14/15px, tight tracking.
- Mono / data: **JetBrains Mono** for IDs, percentages, source counts.

### 5.2 Ops (dark)

- Canvas `#0A0D12`, surfaces `#10141B`, panels `#161B23`, borders `#222833`.
- Ink: primary `#E6EAF2`, secondary `#9AA3B2`, tertiary `#5C6573`.
- Display type: **Inter** (variable, using the display optical-size axis — no separate font file); data still in JetBrains Mono. Drops the Fraunces serif in ops mode for a more "console" feel.
- Subtle 1px grid overlay at 4% opacity on hero modules only.

### 5.3 Semantic encoding (consistent across themes)

Alert tier — the spine of the product:

| Tier | Hue | Light hex | Dark hex | Meaning |
|---|---|---|---|---|
| Watch | cool blue | `#3A6EA5` | `#5B8FCB` | monitor, no action |
| Attention | amber | `#C9821B` | `#E5A23F` | management review, policy assessment |
| Action | red | `#B23A3A` | `#E25C5C` | executive decision in 24–72h |

PPA pillars (accent chips, never primary fills):

- Promote — sage `#5B8466` / `#7FB58E`
- Protect — slate violet `#5E5A8A` / `#8B86C4`
- Access — terracotta `#A85C3E` / `#D08465`

Deliberately non-Shell-brand (no Pecten red/yellow). All combinations pass WCAG AA.

### 5.4 Density & motion

- 4px base grid; padding in multiples of 4.
- Page transitions: 180ms cross-fade.
- Signal cards: 12px translate + 240ms ease-out, staggered 30ms.
- Map signals: pulse ring (1.2s loop) only for Action-tier — visual hierarchy by motion, not saturation.

### 5.5 Iconography

- Lucide everywhere.
- Custom 5-icon monoline SVG set for agent identities (Infectious Disease, Occupational Exposure, Regulatory, Climate–Health, Psychosocial).

## 6. Data Model

```ts
type AlertTier = 'watch' | 'attention' | 'action';
type PPAPillar = 'promote' | 'protect' | 'access';
type AgentId = 'infectious' | 'occupational' | 'regulatory' | 'climate' | 'psychosocial';
type BusinessSegment = 'upstream' | 'integrated-gas' | 'downstream' | 'renewables';
type Region = 'AMER' | 'EMEA' | 'APAC' | 'LATAM' | 'global';

interface Signal {
  id: string;                       // SIG-2026-Q2-014
  title: string;
  summary: string;                  // 1–2 sentence "so what for Shell"
  tier: AlertTier;
  ppa: PPAPillar[];
  agent: AgentId;
  regions: Region[];
  affectedAssets: string[];
  affectedSegments: BusinessSegment[];
  horizon: 'immediate' | '12mo' | '1-5yr';
  confidence: 'low' | 'moderate' | 'high';
  firstDetected: string;
  lastUpdated: string;
  sources: SourceCitation[];
  triangulationCount: number;
  seamMapping: string[];
  recommendedAction: string;
  evidenceTrail: EvidenceItem[];
}

interface SourceCitation {
  type: 'peer-reviewed' | 'who-alert' | 'regulatory' | 'industry' | 'environmental' | 'social';
  publisher: string;
  identifier: string;
  title: string;
  date: string;
  url?: string;
}

interface EvidenceItem {
  date: string;
  agent: AgentId;
  event: string;
  detail: string;
}

interface Brief {
  id: string;
  quarter: string;
  publishedAt: string;
  abstract: string;
  keyFindings: string[];
  thematicDeepDives: { theme: string; summary: string; signalIds: string[] }[];
  watchlistSignalIds: string[];
  signedOffBy: { name: string; role: string }[];
  pdfPath?: string;
}

interface Asset {
  id: string;
  name: string;
  segment: BusinessSegment;
  region: Region;
  country: string;
  coords: [number, number];
  headcountBand: '<100' | '100-500' | '500-2000' | '2000+';
  climateZone: 'tropical' | 'arid' | 'temperate' | 'continental' | 'polar' | 'offshore';
}

interface Agent {
  id: AgentId;
  name: string;
  scanningDomain: string;
  sourcesMonitored: string[];
  signalsOwned: number;
  lastRunAt: string;
}
```

### 6.1 Mock data volume

- **40 signals** (8 per agent × 5 agents)
- **4 quarterly briefs** (Q3 2025 → Q2 2026)
- **22 Shell assets** across Upstream, Integrated Gas/LNG, Downstream/Chemicals, Renewables
- **5 agents** with full persona metadata
- **~120 source citations** (PubMed PMIDs, WHO DON URLs, ECDC RRA IDs, OEUK bulletins, OSHA/NIOSH/HSE rulemakings, IOGP/IPIECA reports)

### 6.2 Mock data strategy

Real-event-grounded illustrative signals (Mpox clade Ib, H5N1 mammalian spillover, AMR carbapenem resistance, NIOSH heat-stress NPRM, ageing offshore workforce psychosocial trends, EU CBAM occupational implications, etc.). Tagged "illustrative — not vendor-validated" in the footer chip. Volume calibrated for credibility, not exhaustiveness.

Generated by a hand-curated seed file via `scripts/generate-mock-data.ts` for reproducibility — no LLM-at-runtime, no fabricated incident data tied to Shell assets.

### 6.3 File layout

```
public/data/
  signals.json
  briefs.json
  assets.json
  agents.json
  meta.json    // last refresh time, total signals, version
```

## 7. Per-View Designs

### 7.1 Dashboard `/`

Single scroll, no tabs. Five horizontal bands.

1. **Hero strip** — auto-rotating ticker (7s, paused on hover) of the 2 Action and 3 Attention signals. Headline `"Global Health Horizon — Q2 2026"` (Fraunces 56pt in editorial / Inter at the display optical size, 48pt, in ops). "Last refreshed: 4 min ago" stamp.
2. **KPI strip (5 metrics)** — Active signals, Signals at Action tier, Assets in elevated-risk regions, Mean confidence, Coverage uptime. 30-day sparkline per tile. Numbers in JetBrains Mono.
3. **PPA balance + Agent activity (split row)** — left: horizontal stacked bar of signal volume by PPA pillar with tier breakdown; right: 5 agent cards (name, signals owned, last run, mini activity pulse). Both clickable as filters.
4. **Geographic snapshot** — 2/3-width simplified world map with asset dots and per-region signal heat-glow. 1/3-width regional risk leaderboard (AMER/EMEA/APAC/LATAM with tier counts). Link to full map.
5. **Recent signal feed** — vertical list of 8 most recently updated signals (tier dot, title, agent icon, regions, confidence chip, "updated 2h ago"). Click → detail.

Footer: illustrative disclaimer.

### 7.2 Signal Explorer `/signals`

Dense, filterable, sortable.

- **Left rail (240px):** facets — Tier, PPA, Agent, Region, Segment, Horizon, Confidence, Date range. Result counts beside each. Active filters as removable chips at top.
- **Top toolbar:** Cmd-K command palette, search, view toggle (Table / Card / Timeline), export-CSV.
- **Main:**
  - Table view (default): ID · Tier · Title · Agent · PPA · Regions · Confidence · Triangulation · First detected · Last updated. Sortable, sticky header, alternating tint. Hover → 250ms quick-peek panel.
  - Card view: 3-column grid of signal mini-cards.
  - Timeline view: signals plotted along time axis (first detected → last updated bar), grouped by agent.

URL state syncs all filters.

### 7.3 Signal Detail `/signals/[id]`

The methodology rigor view.

- **Sticky header:** back link, ID, title (Fraunces large), tier badge, PPA chips, "Action by" date if Action-tier, share + export-PDF.
- **Main column (2/3):**
  - "So what for Shell" — 2-paragraph editorial summary, italic pull-quote.
  - Recommended action — boxed call-out, mapped to SEAM standard(s).
  - Evidence trail — vertical timeline of detection events (NLP pickup → expert validation → tier escalation → cross-source corroboration). Nodes click for source detail.
  - Source citations — grouped by type. Triangulation diagram showing independent corroboration.
  - Affected assets — inline regional map + asset cards.
- **Side column (1/3):**
  - Confidence rating with rationale.
  - Agent provenance card.
  - SEAM mapping.
  - PPA implications (one bullet per pillar).
  - Related signals (3 cards).

### 7.4 Geographic View `/map`

Full-bleed.

- **MapLibre canvas** custom-styled per theme (editorial: pastel land; ops: near-black + amber graticule).
- **Toggleable layers (top-right):** Asset dots, Signal density heatmap, Climate zones, Regulatory jurisdictions.
- **Asset dots** sized by headcount band, colored by business segment (palette distinct from PPA/tier).
- **Signal pins** with tier color; Action-tier pins pulse. Click → 420px right side-sheet with full signal detail; no nav away.
- **Bottom rail:** time-scrubber animating signals across last 90 days at 4×/8×/16× speed.
- **Left collapsible panel:** global filters + region presets (Gulf of Mexico, North Sea, Permian, Niger Delta, Asia-Pacific, Pernis cluster).

### 7.5 Briefs Archive `/briefs`

- **Top:** horizontal carousel of 4 quarter cards (Q3 2025 → Q2 2026), each with key-stat strip (signals scanned, action-tier issued, sources triangulated), publish date, signed-off-by initials. Current quarter emphasized.
- **Inline reader** below carousel for selected brief: executive summary, methodology transparency note, thematic deep dives (linking signals), watchlist table, IOGP/IPIECA benchmarking. Long-form publication feel — Fraunces headings, Inter body, 720px column with break-out figures.
- Floating right-side mini-TOC.
- "Download print-ready PDF" → stub PDFs in `/public/briefs/`.

## 8. Repository Structure

```
shell-health-horizon-dashboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # /
│   ├── signals/
│   │   ├── page.tsx              # /signals
│   │   └── [id]/page.tsx         # /signals/[id] (generateStaticParams)
│   ├── map/page.tsx
│   ├── briefs/page.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn primitives
│   ├── nav/{SideRail,ThemeToggle,GlobalFilters,Footer}.tsx
│   ├── dashboard/{HeroTicker,KpiStrip,PpaBalance,AgentGrid,SnapshotMap,SignalFeed}.tsx
│   ├── signals/{FacetRail,SignalsTable,SignalsCardGrid,SignalsTimeline,QuickPeek}.tsx
│   ├── signal-detail/{EvidenceTrail,SourceCitations,TriangulationDiagram,AffectedAssets}.tsx
│   ├── map/{WorldMap,SignalSheet,TimeScrubber}.tsx
│   ├── briefs/{BriefCarousel,BriefReader}.tsx
│   └── shared/{TierBadge,PpaChip,AgentIcon,ConfidenceMeter,SourceTypeIcon}.tsx
├── lib/{data,filters,types,theme}.ts
├── public/
│   ├── data/{signals,briefs,assets,agents,meta}.json
│   ├── briefs/*.pdf
│   ├── world-110m.json
│   └── fonts/
├── scripts/generate-mock-data.ts
├── docs/superpowers/specs/2026-05-01-shell-health-horizon-dashboard-design.md
├── .github/workflows/deploy.yml
├── next.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## 9. Build & Deployment

### 9.1 `next.config.mjs`

```js
const repo = 'shell-health-horizon-dashboard';
export default {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? `/${repo}` : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? `/${repo}/` : '',
  images: { unoptimized: true },
  trailingSlash: true,
};
```

### 9.2 GitHub Pages workflow

`.github/workflows/deploy.yml` triggers on push to `main` and `workflow_dispatch`. Steps: checkout → setup-node 20 → `npm ci` → `npm run generate:data` → `npm run build` → upload `out/` as Pages artifact → deploy. Repo Pages source set to "GitHub Actions".

### 9.3 npm scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "generate:data": "tsx scripts/generate-mock-data.ts",
  "lint": "next lint",
  "typecheck": "tsc --noEmit"
}
```

### 9.4 Quality gates

- `tsc --noEmit` clean
- `next lint` clean
- All five routes render with no console errors in production build (`npm run build && npx serve out`)
- Lighthouse desktop ≥ 90 on Performance, Accessibility, Best Practices, SEO
- Keyboard nav + visible focus rings on every interactive element
- Screen-reader landmarks + page titles on each route
- Theme toggle persists across reloads and across routes
- Map renders from bundled topojson — no network dependency for tiles in the static export

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `basePath` mismatch breaks asset URLs on Pages | Single `repo` constant in `next.config.mjs`; document in README |
| Map tiles requiring network access | Use bundled `world-110m.json` topojson, no external tile server |
| Fonts FOUT/FOIT degrades editorial feel | Self-host Fraunces/Inter/Inter Display/JetBrains Mono with `font-display: swap` |
| Mock data feels thin under demo scrutiny | 40 signals across 5 agents + 4 briefs is enough to populate every view without empty-state placeholders |
| Evaluator opens on phone | Graceful degradation banner above 768px breakpoint; not in-scope to redesign |
| Disclaimer missed | Persistent footer chip on every page + larger note in README |
