'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { Signal, Asset, Region } from '@/lib/types';

interface Props {
  signals: Signal[];
  assets: Asset[];
}

type GeoFeature = {
  type: string;
  geometry: { type: string; coordinates: unknown };
  properties: Record<string, unknown>;
};

type GeoJson = {
  type: string;
  features: GeoFeature[];
};

const REGIONS: Region[] = ['AMER', 'EMEA', 'APAC', 'LATAM', 'global'];


function MapCanvas({ signals, assets }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [ready, setReady] = useState(false);
  const [paths, setPaths] = useState<string[]>([]);
  const [projectedAssets, setProjectedAssets] = useState<
    { id: string; x: number; y: number }[]
  >([]);
  const [projectedSignals, setProjectedSignals] = useState<
    { id: string; x: number; y: number; tier: string; title: string }[]
  >([]);

  const W = 600;
  const H = 320;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Dynamic imports to avoid SSR issues
        const [d3geo, topoClient, topoJson] = await Promise.all([
          import('d3-geo'),
          import('topojson-client'),
          fetch('/data/world-110m.json').then((r) => r.json()),
        ]);

        if (cancelled) return;

        const projection = d3geo
          .geoNaturalEarth1()
          .scale(90)
          .translate([W / 2, H / 2]);

        const pathGen = d3geo.geoPath().projection(projection);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const topo = topoJson as any;
        const countries = topoClient.feature(topo, topo.objects.countries) as unknown as GeoJson;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const countryPaths = countries.features.map((f) => pathGen(f as any) ?? '');
        setPaths(countryPaths);

        // Project assets
        const pa = assets.map((a) => {
          const pt = projection([a.coords[0], a.coords[1]]);
          return { id: a.id, x: pt ? pt[0] : -100, y: pt ? pt[1] : -100 };
        });
        setProjectedAssets(pa);

        // Project signals (use first affected asset's coords, or derive from region centroid)
        const regionCentroids: Record<string, [number, number]> = {
          EMEA: [25, 25],
          AMER: [-80, 35],
          APAC: [110, 15],
          LATAM: [-60, -15],
          global: [0, 10],
        };

        const elevated = signals.filter(
          (s) => s.tier === 'action' || s.tier === 'attention',
        );
        const signalPts = elevated.map((s) => {
          // Try to get coords from the first affected asset
          const firstAsset = assets.find((a) => s.affectedAssets.includes(a.id));
          const coords: [number, number] = firstAsset
            ? [firstAsset.coords[0], firstAsset.coords[1]]
            : regionCentroids[s.regions[0]] ?? [0, 0];
          const pt = projection(coords);
          return {
            id: s.id,
            x: pt ? pt[0] : -100,
            y: pt ? pt[1] : -100,
            tier: s.tier,
            title: s.title,
          };
        });
        setProjectedSignals(signalPts);
        setReady(true);
      } catch (e) {
        console.error('Map init failed', e);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [signals, assets]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      aria-label="Geographic snapshot map"
    >
      {/* Country outlines */}
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--border)" strokeWidth={0.5} />
      ))}

      {/* Asset dots */}
      {ready &&
        projectedAssets.map((a) => (
          <circle
            key={a.id}
            cx={a.x}
            cy={a.y}
            r={2.5}
            fill="var(--ink-secondary)"
            opacity={0.75}
          />
        ))}

      {/* Signal dots — elevated only */}
      {ready &&
        projectedSignals.map((s) => (
          <g key={s.id}>
            <title>{s.title}</title>
            {s.tier === 'action' && (
              <>
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={6}
                  fill="var(--tier-action)"
                  opacity={0.25}
                >
                  <animate attributeName="r" values="5;10;5" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="1.2s" repeatCount="indefinite" />
                </circle>
                <circle cx={s.x} cy={s.y} r={4} fill="var(--tier-action)" />
              </>
            )}
            {s.tier === 'attention' && (
              <circle cx={s.x} cy={s.y} r={4} fill="var(--tier-attention)" />
            )}
          </g>
        ))}
    </svg>
  );
}

function RegionLeaderboard({ signals }: { signals: Signal[] }) {
  const rows = REGIONS.map((region) => {
    const regionSignals = signals.filter((s) => s.regions.includes(region));
    return {
      region,
      label: region,
      total: regionSignals.length,
      action: regionSignals.filter((s) => s.tier === 'action').length,
      attention: regionSignals.filter((s) => s.tier === 'attention').length,
      watch: regionSignals.filter((s) => s.tier === 'watch').length,
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)]">
        Regional Risk Index
      </h3>
      <div className="flex flex-col gap-1">
        {rows.map((row, rank) => (
          <div
            key={row.region}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2"
          >
            <span className="font-mono text-[10px] text-[var(--ink-tertiary)] w-4 shrink-0">
              {rank + 1}
            </span>
            <span className="font-mono text-xs font-semibold text-[var(--ink)] w-14 shrink-0">
              {row.label}
            </span>
            <div className="flex items-center gap-1 flex-1">
              {row.action > 0 && (
                <span className="inline-flex items-center rounded-sm px-1 py-0.5 font-mono text-[9px] text-white" style={{ background: 'var(--tier-action)' }}>
                  {row.action} Act
                </span>
              )}
              {row.attention > 0 && (
                <span className="inline-flex items-center rounded-sm px-1 py-0.5 font-mono text-[9px] text-white" style={{ background: 'var(--tier-attention)' }}>
                  {row.attention} Att
                </span>
              )}
              {row.watch > 0 && (
                <span className="inline-flex items-center rounded-sm px-1 py-0.5 font-mono text-[9px] text-white" style={{ background: 'var(--tier-watch)' }}>
                  {row.watch} Wtch
                </span>
              )}
            </div>
            <span className="font-mono text-xs text-[var(--ink-secondary)] shrink-0">{row.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SnapshotMap({ signals, assets }: Props) {
  return (
    <section
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
      aria-label="Geographic snapshot"
    >
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h2 className="text-sm font-semibold text-[var(--ink)]">Geographic Snapshot</h2>
        <Link
          href="/map"
          className="flex items-center gap-1 font-mono text-[10px] text-[var(--ink-tertiary)] hover:text-[var(--ink)] transition-colors"
        >
          Open full map
          <ExternalLink size={10} />
        </Link>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-6 pb-3">
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--ink-tertiary)]">
          <span className="size-2 rounded-full inline-block" style={{ background: 'var(--ink-secondary)' }} />
          Asset
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--ink-tertiary)]">
          <span className="size-2 rounded-full inline-block" style={{ background: 'var(--tier-attention)' }} />
          Attention
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--ink-tertiary)]">
          <span className="size-2 rounded-full inline-block" style={{ background: 'var(--tier-action)' }} />
          Action (pulsing)
        </span>
      </div>

      <div className="flex gap-0">
        {/* Map — 2/3 */}
        <div className="flex-1 min-w-0 border-r border-[var(--border)] bg-[var(--panel)]">
          <MapCanvas signals={signals} assets={assets} />
        </div>

        {/* Leaderboard — 1/3 */}
        <div className="w-[280px] shrink-0 px-4 py-4">
          <RegionLeaderboard signals={signals} />
        </div>
      </div>
    </section>
  );
}
