# CLAUDE.md — Shell Health Horizon Dashboard

Project-level instructions for Claude Code sessions opened in this repo.

## Project

Illustrative prototype dashboard for the Shell Health Horizon Scanning RFI (Deliverable C). Real-event-grounded mock data, dual-theme (editorial light + ops dark), Next.js static export deployed to GitHub Pages at https://olatechie.github.io/health-horizon-dashboard-mockup/.

**Hard constraints (do not violate):**
- Do **not** display the Shell Pecten or Shell brand colors (red/yellow). RFI clause 3.d forbids it.
- The illustrative-prototype disclaimer footer ships on every page. Do not remove or weaken it.
- `basePath` in `next.config.ts` is `health-horizon-dashboard-mockup` — must match the GitHub repo name. Don't rename without updating both.
- Mock data is human-curated in `scripts/seed/*.seed.ts` and regenerated via `npm run generate:data`. Do not introduce LLM-at-runtime data generation.

## Stack

Next.js 15 (App Router, `output: 'export'`) · TypeScript strict · Tailwind v4 · shadcn-style primitives · Recharts · MapLibre GL · Framer Motion · Vitest · self-hosted variable fonts.

## Quality gates (before any commit to main)

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

All four must be clean. The repo is wired to a GitHub Action that re-runs these on push and deploys to Pages on success.

## Commit conventions

Conventional commits (`feat:`, `fix:`, `chore:`, `ci:`, `docs:`). Co-author tags acceptable when the work was done with Claude assistance.

---

## Design Context

### Users

Senior Shell Health leadership and adjacent governance audiences:
- **Shell Health executives** (PPA pillar leads, lead expert authors of the quarterly Brief)
- **HSSE Policy leads** at Shell HQ
- **Regional health leads** in business segments (Upstream, Integrated Gas/LNG, Downstream/Chemicals, Renewables)
- **RFI evaluators** at Shell Supply Chain Commercial — first-impression audience, desktop, single sitting

Job-to-be-done: translate continuous global health signal volume into PPA-tagged, SEAM-mapped executive decisions within the 24–72h decision window for Action-tier alerts. Within seconds of opening the dashboard the user must know:
1. Is anything Action-tier today, and what does it ask me to decide?
2. Is the methodology defensible if I'm asked by HSSE board?
3. Where on Shell's footprint does this matter?

### Brand Personality

**Operational · Forensic · Live**, holding hands with **Premium · Strategic · Considered**.

Pure Palantir-ops without consultancy gloss reads as analyst tool, not executive deliverable. Pure McKinsey-deck without live operational register reads as static slideware. The product needs both registers in tension.

### Aesthetic Direction

**Primary references** (user-selected): Palantir Foundry, Bloomberg Terminal — operational density, color-coded entity types, mono accents, time-stamped data, asymmetric panel composition, amber/red signal hierarchy.

**Anti-reference** (user-rejected): Corporate enterprise IT portal (SAP/Oracle/Workday). No slab buttons, no flat low-contrast greys, no dated card grids.

**Theme posture:**
- **Editorial (light)** is default. Warm off-white canvas, generous editorial type for headlines, restrained density, used for cognitive ease on first paint and reading the long-form Brief.
- **Ops (dark)** is the situation-room mode. Near-black blue canvas, panel-on-panel composition, mono-coded data, restrained accent color. Should feel *more* invested than the light theme.

**Color encoding:**
- Tier (Watch / Attention / Action) is the spine. Cool blue → amber → red. Only Action-tier earns motion (pulsing rings).
- PPA pillars (Promote / Protect / Access) appear as accent chips (sage / slate-violet / terracotta) — never primary fills.
- No Shell brand colors.

### Design Principles

1. **Tier hierarchy beats decoration.** Visual decisions reinforce Watch → Attention → Action. Flourishes that weaken it are cut.
2. **Methodology is the design.** Triangulation count, source-type icons, evidence-trail timeline, confidence rationale earn pixels because they are why an evaluator trusts the platform.
3. **Time-coding everywhere.** Every datum has a "last updated" stamp; mono small-caps for timestamps. The product must feel alive, not retrospective.
4. **Density is a feature.** Tight 4px grid, panel-on-panel composition. Whitespace is rationed where it does hierarchy work.
5. **Both themes are first-class.** Theme toggle is a posture switch, not a preference.

## Anti-Slop Checklist (project-specific)

Do not introduce:
- Side-stripe colored borders on cards/list items (`border-left/right` >1px).
- Gradient text via `background-clip: text`.
- Glassmorphism on map overlays or filter panels.
- Sparklines as pure decoration.
- Generic icon+heading+text card grids.
- Centered hero metrics with gradient accents.
- The default AI palette (cyan-on-dark, purple-to-blue gradients, neon accents).

## Notes for Future Design Passes

- Type stack currently uses Fraunces + Inter + JetBrains Mono. All three are on the impeccable reflex-fonts-to-reject list. A future `/impeccable typeset` pass should re-evaluate, but only if a clearly better pairing presents itself — novelty alone is not justification.
- Color tokens are defined as hex CSS variables in `app/globals.css`. A future pass converting to true OKLCH and tinting neutrals toward the brand hue is a candidate for `/impeccable colorize`.
- The `/map` view's region-preset buttons currently close the panel without panning the map. Lifting the MapLibre instance ref to enable pan/zoom is a candidate `/impeccable harden` task.
