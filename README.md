# Shell Health Horizon — Executive Intelligence (Prototype)

Illustrative prototype dashboard for the Shell Health Horizon Scanning RFI (Deliverable C).
**Disclaimer:** Real-event-grounded mock data. Not vendor-validated. Shell Pecten not displayed.

📄 **[Page-by-page walkthrough with screenshots →](docs/walkthrough.md)**

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
1. Push to `main` of a GitHub repo named `health-horizon-dashboard-mockup`.
2. In Settings → Pages, set Source to "GitHub Actions".
3. The action publishes `out/` automatically.

Live URL once deployed: `https://olatechie.github.io/health-horizon-dashboard-mockup/`

## Configuring the repo name
The `repo` constant in `next.config.ts` must match your GitHub repo name (powers `basePath`/`assetPrefix`). If you fork under a different name, update both.

## Stack
Next.js 15 (App Router, static export) · TypeScript strict · Tailwind v4 · shadcn/ui · Recharts · MapLibre GL · Framer Motion · Vitest.
