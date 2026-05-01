/**
 * Build a URL for a static asset under `public/`, honoring the configured
 * Next.js `basePath` so client-side fetches work on GitHub Pages where
 * the site is served from a subpath (e.g. `/health-horizon-dashboard-mockup`).
 *
 * Pass an absolute path beginning with `/` (e.g. `/data/signals.json`).
 * In dev, basePath is empty and the result is unchanged; in prod, the
 * configured basePath is prepended.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function assetUrl(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${BASE}${path}`;
}
