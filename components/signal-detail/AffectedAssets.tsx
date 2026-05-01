import type { Asset, Region } from '@/lib/types';

// Bounding boxes per region [minLon, minLat, maxLon, maxLat]
const REGION_BBOX: Record<Region, [number, number, number, number]> = {
  AMER:   [-130, -60, -30,  60],
  EMEA:   [ -25,  -5,  60,  65],
  APAC:   [  90, -45, 175,  45],
  LATAM:  [ -85, -60, -30,  15],
  global: [-180, -75, 180,  75],
};

const SVG_W = 560;
const SVG_H = 220;
const PADDING = 20;

function lngToX(lng: number, minLon: number, maxLon: number): number {
  return PADDING + ((lng - minLon) / (maxLon - minLon)) * (SVG_W - PADDING * 2);
}

function latToY(lat: number, minLat: number, maxLat: number): number {
  // Flip Y axis (SVG top = high lat)
  return PADDING + ((maxLat - lat) / (maxLat - minLat)) * (SVG_H - PADDING * 2);
}

function determineBbox(regions: Region[]): [number, number, number, number] {
  if (regions.includes('global')) return REGION_BBOX['global'];
  // Merge bboxes of all regions
  let [minLon, minLat, maxLon, maxLat] = [180, 90, -180, -90];
  for (const r of regions) {
    const [mlo, mla, xlo, xla] = REGION_BBOX[r];
    minLon = Math.min(minLon, mlo);
    minLat = Math.min(minLat, mla);
    maxLon = Math.max(maxLon, xlo);
    maxLat = Math.max(maxLat, xla);
  }
  // Add 10% padding
  const dlon = (maxLon - minLon) * 0.1;
  const dlat = (maxLat - minLat) * 0.1;
  return [minLon - dlon, minLat - dlat, maxLon + dlon, maxLat + dlat];
}

const SEGMENT_COLOR: Record<string, string> = {
  upstream:        '#3A6EA5',
  'integrated-gas':'#5E5A8A',
  downstream:      '#C9821B',
  renewables:      '#5B8466',
};

const REGION_LABEL_COLORS: Record<Region, string> = {
  AMER:   '#3A6EA5',
  EMEA:   '#C9821B',
  APAC:   '#5B8466',
  LATAM:  '#A85C3E',
  global: '#5E5A8A',
};

export function AffectedAssets({
  assetIds,
  allAssets,
  regions,
}: {
  assetIds: string[];
  allAssets: Asset[];
  regions: string[];
}) {
  const assets = allAssets.filter((a) => assetIds.includes(a.id));

  if (assets.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-tertiary)] italic">No affected assets identified.</p>
    );
  }

  const bbox = determineBbox(regions as Region[]);
  const [minLon, minLat, maxLon, maxLat] = bbox;

  return (
    <div className="flex flex-col gap-4">
      {/* SVG Map */}
      <div className="border border-hair rounded-md overflow-hidden bg-[var(--panel)]">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          className="block"
          aria-label="Affected assets regional map"
        >
          {/* Background */}
          <rect width={SVG_W} height={SVG_H} fill="var(--panel)" />

          {/* Graticule lines (simplified grid) */}
          {[-60, -30, 0, 30, 60].map((lat) => {
            const y = latToY(lat, minLat, maxLat);
            if (y < PADDING || y > SVG_H - PADDING) return null;
            return (
              <line
                key={`lat-${lat}`}
                x1={PADDING}
                x2={SVG_W - PADDING}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth={0.5}
                strokeDasharray="3 4"
              />
            );
          })}
          {[-120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lng) => {
            const x = lngToX(lng, minLon, maxLon);
            if (x < PADDING || x > SVG_W - PADDING) return null;
            return (
              <line
                key={`lng-${lng}`}
                x1={x}
                x2={x}
                y1={PADDING}
                y2={SVG_H - PADDING}
                stroke="var(--border)"
                strokeWidth={0.5}
                strokeDasharray="3 4"
              />
            );
          })}

          {/* Region label */}
          {(regions as Region[]).filter((r) => r !== 'global').map((r) => {
            const [lo, la, xo, xa] = REGION_BBOX[r];
            const cx = lngToX((lo + xo) / 2, minLon, maxLon);
            const cy = latToY((la + xa) / 2, minLat, maxLat);
            return (
              <text
                key={r}
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fontFamily="var(--font-mono)"
                fill={REGION_LABEL_COLORS[r]}
                fillOpacity={0.18}
                fontWeight="700"
                letterSpacing="0.12em"
              >
                {r}
              </text>
            );
          })}

          {/* Asset nodes */}
          {assets.map((asset) => {
            const [lng, lat] = asset.coords;
            const x = lngToX(lng, minLon, maxLon);
            const y = latToY(lat, minLat, maxLat);
            const color = SEGMENT_COLOR[asset.segment] ?? '#8B8F96';

            return (
              <g key={asset.id}>
                {/* pulse ring */}
                <circle cx={x} cy={y} r={10} fill={color} fillOpacity={0.12} />
                {/* main dot */}
                <circle cx={x} cy={y} r={5} fill={color} fillOpacity={0.9} />
                {/* label */}
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily="var(--font-mono)"
                  fill="var(--ink)"
                  fontWeight="600"
                  letterSpacing="0.03em"
                  style={{ textShadow: '0 0 3px var(--panel)' }}
                >
                  {asset.name.length > 18 ? asset.name.slice(0, 17) + '…' : asset.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Asset cards */}
      <ul className="grid gap-2 sm:grid-cols-2">
        {assets.map((asset) => (
          <li
            key={asset.id}
            className="flex flex-col gap-1 px-3 py-2.5 rounded-md border border-hair bg-[var(--surface)]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-[var(--ink)]">{asset.name}</span>
              <span
                className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  color: SEGMENT_COLOR[asset.segment] ?? '#8B8F96',
                  background: (SEGMENT_COLOR[asset.segment] ?? '#8B8F96') + '18',
                }}
              >
                {asset.segment}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              <span className="text-[10px] text-[var(--ink-secondary)]">{asset.country}</span>
              <span className="text-[10px] text-[var(--ink-tertiary)]">{asset.headcountBand} HC</span>
              <span className="text-[10px] text-[var(--ink-tertiary)] capitalize">{asset.climateZone}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
