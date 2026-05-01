/**
 * Generate raster favicons + apple-touch-icon from app/icon.svg.
 *
 * Why: SVG favicons cover modern browsers, but a few surfaces still need
 * raster:
 *   - app/apple-icon.png  → iOS / iPadOS Add-to-Home-Screen, Safari pinned tabs
 *   - app/favicon.ico     → legacy fallback (Outlook web, some embeds)
 *   - public/icon-{192,512}.png → PWA / social previews
 *
 * Run with `npm run generate:favicons`. The SVG at app/icon.svg is the
 * source of truth — change it there and re-run.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'app', 'icon.svg');

interface Target {
  out: string;
  size: number;
  alpha?: boolean; // false → flatten on a solid square (Apple guidelines reject transparent)
  background?: string;
}

const targets: Target[] = [
  // Next.js conventions in app/ — auto-served at /icon.png and /apple-icon.png
  { out: 'app/icon.png',         size: 32,  alpha: true },
  { out: 'app/apple-icon.png',   size: 180, alpha: false, background: '#0E1116' },
  // PWA manifest sizes (kept in public/ so they're directly fetchable)
  { out: 'public/icon-192.png',  size: 192, alpha: true },
  { out: 'public/icon-512.png',  size: 512, alpha: true },
];

const svg = fs.readFileSync(SRC);

(async () => {
  for (const t of targets) {
    let pipeline = sharp(svg, { density: 384 }).resize(t.size, t.size);
    if (!t.alpha && t.background) {
      pipeline = pipeline.flatten({ background: t.background });
    }
    await pipeline.png().toFile(path.join(ROOT, t.out));
    console.log(`  ✓ ${t.out}  (${t.size}×${t.size})`);
  }

  // ICO needs multiple PNG sizes packed into one file. Browsers pick the
  // resolution that matches the surface (16=tab, 32=bookmarks, 48=Windows).
  const icoSizes = [16, 32, 48];
  const icoBufs = await Promise.all(
    icoSizes.map((s) =>
      sharp(svg, { density: 384 }).resize(s, s).png().toBuffer(),
    ),
  );
  const icoBuf = await pngToIco(icoBufs);
  fs.writeFileSync(path.join(ROOT, 'app', 'favicon.ico'), icoBuf);
  console.log(`  ✓ app/favicon.ico  (16+32+48 multi-resolution)`);

  console.log('\nFavicons generated from app/icon.svg.');
})();
