'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useCallback } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { Signal, Asset, AlertTier, BusinessSegment, HeadcountBand } from '@/lib/types';
import { assetUrl } from '@/lib/assetUrl';

interface WorldMapProps {
  signals: Signal[];
  assets: Asset[];
  visibleLayers: Set<string>;
  scrubberDate: Date;
  onSelect: (signalId: string) => void;
  /** Region preset to fly to. Increment `flyToVersion` to re-fly to the same region. */
  flyToRegion?: RegionPresetId | null;
  flyToVersion?: number;
}

export type RegionPresetId =
  | 'gulf-of-mexico'
  | 'north-sea'
  | 'permian'
  | 'niger-delta'
  | 'asia-pacific'
  | 'pernis-cluster';

// [west, south, east, north] bounding boxes — calibrated to actual asset coords
// in scripts/seed/assets.seed.ts. Padded enough that asset markers + nearby
// land mass are visible at the resulting zoom level.
export const REGION_BOUNDS: Record<RegionPresetId, [number, number, number, number]> = {
  'gulf-of-mexico':  [-98, 22, -85, 32],     // Auger, Perdido, Vito, Deer Park, Norco
  'north-sea':       [-2, 55, 6, 60],        // Nelson, Shearwater
  'permian':         [-105, 29, -100, 34],   // Permian Basin Operations
  'niger-delta':     [3, 3, 8, 6.5],         // Bonga, Niger Delta Assets
  'asia-pacific':    [100, -28, 155, 25],    // Prelude, QGC, Bukom, Nanhai
  'pernis-cluster':  [3.5, 51.4, 5.4, 52.6], // Pernis, Moerdijk, Rotterdam Biofuels, Holland Hydrogen, ETC Amsterdam
};

// Asset color by segment
const SEGMENT_COLOR: Record<BusinessSegment, string> = {
  'upstream': '#3D5A80',
  'integrated-gas': '#5E5A8A',
  'downstream': '#6E5C3D',
  'renewables': '#5B8466',
};

// Asset radius by headcount band
const HEADCOUNT_RADIUS: Record<HeadcountBand, number> = {
  '<100': 4,
  '100-500': 6,
  '500-2000': 8,
  '2000+': 10,
};

// Tier colors (light / editorial defaults — theme observer updates them)
const TIER_COLOR: Record<AlertTier, string> = {
  watch: '#3A6EA5',
  attention: '#C9821B',
  action: '#B23A3A',
};

function getTheme(): 'editorial' | 'ops' {
  if (typeof document === 'undefined') return 'editorial';
  return (document.documentElement.dataset.theme as 'editorial' | 'ops') ?? 'editorial';
}

function buildStyle(theme: 'editorial' | 'ops'): maplibregl.StyleSpecification {
  const isOps = theme === 'ops';
  return {
    version: 8,
    sources: {
      countries: {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }, // filled after load
      },
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': isOps ? '#0A0D12' : '#FAFAF7',
        },
      },
      {
        id: 'countries-fill',
        type: 'fill',
        source: 'countries',
        paint: {
          'fill-color': isOps ? '#10141B' : '#EAE8E0',
          'fill-opacity': 1,
        },
      },
      {
        id: 'countries-outline',
        type: 'line',
        source: 'countries',
        paint: {
          'line-color': isOps ? '#222833' : '#D0CEC5',
          'line-width': 0.5,
        },
      },
    ],
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  } as unknown as maplibregl.StyleSpecification;
}

export function WorldMap({ signals, assets, visibleLayers, scrubberDate, onSelect, flyToRegion, flyToVersion }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const pulseRadiusRef = useRef<boolean>(true);

  // Memoized GeoJSON from topojson
  const geojsonRef = useRef<object | null>(null);

  const updateLayers = useCallback((map: MapLibreMap) => {
    if (!map.isStyleLoaded()) return;
    const theme = getTheme();
    const isOps = theme === 'ops';

    // Background
    if (map.getLayer('background')) {
      map.setPaintProperty('background', 'background-color', isOps ? '#0A0D12' : '#FAFAF7');
    }
    // Countries
    if (map.getLayer('countries-fill')) {
      map.setPaintProperty('countries-fill', 'fill-color', isOps ? '#10141B' : '#EAE8E0');
    }
    if (map.getLayer('countries-outline')) {
      map.setPaintProperty('countries-outline', 'line-color', isOps ? '#222833' : '#D0CEC5');
    }
  }, []);

  const addDataLayers = useCallback((map: MapLibreMap, mapSignals: Signal[], mapAssets: Asset[]) => {
    if (!map.isStyleLoaded()) return;
    const theme = getTheme();
    const isOps = theme === 'ops';

    // Build asset GeoJSON
    const assetFeatures = mapAssets.map((a) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [a.coords[0], a.coords[1]] },
      properties: {
        id: a.id,
        name: a.name,
        segment: a.segment,
        headcountBand: a.headcountBand,
        color: SEGMENT_COLOR[a.segment] ?? '#888',
        radius: HEADCOUNT_RADIUS[a.headcountBand] ?? 6,
      },
    }));

    const assetGeoJSON = { type: 'FeatureCollection' as const, features: assetFeatures };

    // Build signal GeoJSON
    const regionCentroids: Record<string, [number, number]> = {
      EMEA: [25, 25],
      AMER: [-80, 35],
      APAC: [110, 15],
      LATAM: [-60, -15],
      global: [0, 10],
    };

    const signalFeatures = mapSignals.map((s) => {
      const firstAsset = mapAssets.find((a) => s.affectedAssets.includes(a.id));
      const coords: [number, number] = firstAsset
        ? [firstAsset.coords[0], firstAsset.coords[1]]
        : (regionCentroids[s.regions[0]] ?? [0, 10]);

      const tierColors = isOps
        ? { watch: '#5B8FCB', attention: '#E5A23F', action: '#E25C5C' }
        : TIER_COLOR;

      return {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [coords[0], coords[1]] },
        properties: {
          id: s.id,
          title: s.title,
          tier: s.tier,
          color: tierColors[s.tier],
          isAction: s.tier === 'action' ? 1 : 0,
        },
      };
    });

    const signalGeoJSON = { type: 'FeatureCollection' as const, features: signalFeatures };

    // Remove existing data layers
    ['signal-pulse', 'signals', 'assets'].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    ['assets-src', 'signals-src'].forEach((id) => {
      if (map.getSource(id)) map.removeSource(id);
    });

    // Assets layer
    if (visibleLayers.has('assets')) {
      map.addSource('assets-src', { type: 'geojson', data: assetGeoJSON });
      map.addLayer({
        id: 'assets',
        type: 'circle',
        source: 'assets-src',
        paint: {
          'circle-radius': ['get', 'radius'],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.85,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.4)',
        },
      });
    }

    // Signal density heatmap
    if (visibleLayers.has('signal-density')) {
      map.addSource('signals-src', { type: 'geojson', data: signalGeoJSON });
      map.addLayer({
        id: 'signals',
        type: 'heatmap',
        source: 'signals-src',
        paint: {
          'heatmap-radius': 30,
          'heatmap-opacity': 0.6,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgba(103,169,207,0.5)',
            0.4, 'rgba(209,229,240,0.7)',
            0.6, 'rgba(253,219,199,0.8)',
            0.8, 'rgba(239,138,98,0.9)',
            1, 'rgba(178,56,56,1)',
          ],
        },
      });
    }

    // Signal pins (always shown when signal-density is off)
    if (!visibleLayers.has('signal-density')) {
      if (!map.getSource('signals-src')) {
        map.addSource('signals-src', { type: 'geojson', data: signalGeoJSON });
      }
      map.addLayer({
        id: 'signals',
        type: 'circle',
        source: 'signals-src',
        paint: {
          'circle-radius': 7,
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.9,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.6)',
        },
      });

      // Pulse layer for action tier
      map.addLayer({
        id: 'signal-pulse',
        type: 'circle',
        source: 'signals-src',
        filter: ['==', ['get', 'isAction'], 1],
        paint: {
          'circle-radius': 14,
          'circle-color': 'transparent',
          'circle-opacity': 0.4,
          'circle-stroke-width': 2,
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-opacity': 0.5,
        },
      });
    }

    // Click handler on signals
    const clickHandler = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['signals'] });
      if (features.length > 0) {
        const id = features[0].properties?.id as string;
        if (id) onSelect(id);
      }
    };

    map.off('click', clickHandler);
    map.on('click', clickHandler);

    // Cursor change
    map.off('mouseenter', 'signals', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseenter', 'signals', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.off('mouseleave', 'signals', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseleave', 'signals', () => { map.getCanvas().style.cursor = ''; });

  }, [visibleLayers, onSelect]);

  const startPulse = useCallback((map: MapLibreMap) => {
    if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    pulseIntervalRef.current = setInterval(() => {
      if (!map.isStyleLoaded() || !map.getLayer('signal-pulse')) return;
      pulseRadiusRef.current = !pulseRadiusRef.current;
      const r = pulseRadiusRef.current ? 14 : 20;
      const op = pulseRadiusRef.current ? 0.5 : 0.1;
      map.setPaintProperty('signal-pulse', 'circle-radius', r);
      map.setPaintProperty('signal-pulse', 'circle-stroke-opacity', op);
    }, 600);
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    async function initMap() {
      const maplibregl = (await import('maplibre-gl')).default;
      if (cancelled || !containerRef.current) return;

      // Load & convert topojson to GeoJSON (memoized)
      let countriesGeoJSON = geojsonRef.current;
      if (!countriesGeoJSON) {
        try {
          const [topoClient, topoData] = await Promise.all([
            import('topojson-client'),
            fetch(assetUrl('/data/world-110m.json')).then((r) => r.json()),
          ]);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          countriesGeoJSON = topoClient.feature(topoData as any, (topoData as any).objects.countries);
          geojsonRef.current = countriesGeoJSON;
        } catch (e) {
          console.error('Failed to load world-110m.json:', e);
          countriesGeoJSON = { type: 'FeatureCollection', features: [] };
        }
      }

      if (cancelled) return;

      const theme = getTheme();
      const style = buildStyle(theme);

      const map = new maplibregl.Map({
        container: containerRef.current!,
        style,
        center: [10, 20],
        zoom: 1.4,
        minZoom: 0.5,
        maxZoom: 10,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on('load', () => {
        if (cancelled) return;

        // Inject countries GeoJSON into the source
        const src = map.getSource('countries') as maplibregl.GeoJSONSource | undefined;
        if (src && countriesGeoJSON) {
          src.setData(countriesGeoJSON as GeoJSON.FeatureCollection);
        }

        addDataLayers(map, signals, assets);
        startPulse(map);
      });

      // Theme observer
      const observer = new MutationObserver(() => {
        if (mapRef.current && mapRef.current.isStyleLoaded()) {
          updateLayers(mapRef.current);
          // Re-add data layers to apply theme-aware colors
          addDataLayers(mapRef.current, signals, assets);
        }
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
      observerRef.current = observer;
    }

    initMap();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  // Update data layers when signals/assets/visibleLayers/scrubberDate change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    addDataLayers(map, signals, assets);
  }, [signals, assets, visibleLayers, scrubberDate, addDataLayers]);

  // Region preset fly-to. Re-runs whenever flyToVersion increments, so
  // clicking the same preset twice still re-flies (escape-from-zoom).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToRegion) return;
    const bounds = REGION_BOUNDS[flyToRegion];
    if (!bounds) return;
    map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      { padding: 80, duration: 900, essential: true },
    );
  }, [flyToRegion, flyToVersion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
      if (observerRef.current) observerRef.current.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      aria-label="Geographic map of Shell assets and health signals"
      role="img"
    />
  );
}
