'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Signal, Asset } from '@/lib/types';
import { LayerToggles } from './LayerToggles';
import { TimeScrubber } from './TimeScrubber';
import { SignalSheet } from './SignalSheet';

// Dynamic import of WorldMap to avoid SSR issues with MapLibre
const WorldMap = dynamic(() => import('./WorldMap').then((m) => m.WorldMap), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-[var(--tier-watch)] border-t-transparent animate-spin" />
        <span className="font-mono text-xs text-[var(--ink-tertiary)]">Loading map…</span>
      </div>
    </div>
  ),
});

type RegionPresetId =
  | 'gulf-of-mexico'
  | 'north-sea'
  | 'permian'
  | 'niger-delta'
  | 'asia-pacific'
  | 'pernis-cluster';

const REGION_PRESETS: { id: RegionPresetId; label: string }[] = [
  { id: 'gulf-of-mexico', label: 'Gulf of Mexico' },
  { id: 'north-sea', label: 'North Sea' },
  { id: 'permian', label: 'Permian' },
  { id: 'niger-delta', label: 'Niger Delta' },
  { id: 'asia-pacific', label: 'Asia-Pacific' },
  { id: 'pernis-cluster', label: 'Pernis cluster' },
];

type PlaySpeed = 1 | 4 | 8 | 16;

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

// Start with no overlay layers active so the signal pins — particularly the
// pulsing Action-tier ones — read first on initial paint. Asset dots are
// dense at low zoom and obscure the few signals that actually need executive
// attention; users can toggle them on from the LayerToggles panel.
const DEFAULT_LAYERS = new Set<string>();

interface MapViewProps {
  signals: Signal[];
  assets: Asset[];
}

export function MapView({ signals, assets }: MapViewProps) {
  const nowRef = useRef(Date.now());
  const now = nowRef.current;

  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(DEFAULT_LAYERS);
  const [scrubberDate, setScrubberDate] = useState<Date>(() => new Date(now));
  const [playSpeed, setPlaySpeed] = useState<PlaySpeed>(4);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState<RegionPresetId | null>(null);
  const [flyToVersion, setFlyToVersion] = useState(0);

  // Filter signals by scrubber date window (firstDetected <= scrubberDate && lastUpdated >= scrubberDate - 14d)
  const filteredSignals = useMemo(() => {
    const scrubMs = scrubberDate.getTime();
    const windowStart = scrubMs - FOURTEEN_DAYS_MS;
    return signals.filter((s) => {
      const firstMs = new Date(s.firstDetected).getTime();
      const lastMs = new Date(s.lastUpdated).getTime();
      return firstMs <= scrubMs && lastMs >= windowStart;
    });
  }, [signals, scrubberDate]);

  const selectedSignal = useMemo(
    () => (selectedSignalId ? signals.find((s) => s.id === selectedSignalId) ?? null : null),
    [signals, selectedSignalId],
  );

  const handleLayerToggle = useCallback((id: string) => {
    setVisibleLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback((signalId: string) => {
    setSelectedSignalId(signalId);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedSignalId(null);
  }, []);

  const handleScrubberChange = useCallback((date: Date) => {
    setScrubberDate(date);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Map canvas */}
      <WorldMap
        signals={filteredSignals}
        assets={assets}
        visibleLayers={visibleLayers}
        scrubberDate={scrubberDate}
        onSelect={handleSelect}
        flyToRegion={activeRegion}
        flyToVersion={flyToVersion}
      />

      {/* Layer toggles — top right */}
      <LayerToggles visibleLayers={visibleLayers} onChange={handleLayerToggle} />

      {/* Left filter panel toggle */}
      <button
        onClick={() => setFilterPanelOpen((v) => !v)}
        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg
                   border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-sm
                   text-[var(--ink-secondary)] hover:text-[var(--ink)] transition-colors shadow"
        aria-label={filterPanelOpen ? 'Close filter panel' : 'Open filter panel'}
        aria-expanded={filterPanelOpen}
      >
        <Filter size={13} />
        <span className="text-[11px] font-mono">Filters</span>
        {filterPanelOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Left filter panel */}
      {filterPanelOpen && (
        <div
          className="absolute top-16 left-4 z-10 w-56 rounded-xl border border-[var(--border)]
                     bg-[var(--surface)]/95 backdrop-blur-sm shadow-lg overflow-hidden"
        >
          {/* Region presets */}
          <div className="px-3 py-2.5 border-b border-[var(--border)]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)]">
              Region presets
            </span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {REGION_PRESETS.map((preset) => {
              const isActive = activeRegion === preset.id;
              return (
                <button
                  key={preset.id}
                  className={
                    'w-full text-left px-3 py-2 text-[11px] hover:bg-[var(--panel)] ' +
                    'hover:text-[var(--ink)] transition-colors font-mono ' +
                    (isActive ? 'text-[var(--ink)] bg-[var(--panel)]' : 'text-[var(--ink-secondary)]')
                  }
                  aria-label={`Zoom to ${preset.label}`}
                  aria-pressed={isActive}
                  onClick={() => {
                    setActiveRegion(preset.id);
                    setFlyToVersion((v) => v + 1);
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Active signal counts */}
          <div className="px-3 py-2.5 border-t border-[var(--border)] bg-[var(--panel)]">
            <span className="text-[10px] font-mono text-[var(--ink-tertiary)]">
              {filteredSignals.length} signal{filteredSignals.length !== 1 ? 's' : ''} in window
            </span>
          </div>
        </div>
      )}

      {/* Signal sheet — right side */}
      <SignalSheet signal={selectedSignal} onClose={handleCloseSheet} />

      {/* Time scrubber — bottom rail */}
      <TimeScrubber
        scrubberDate={scrubberDate}
        onChange={handleScrubberChange}
        playSpeed={playSpeed}
        onSpeedChange={(s) => setPlaySpeed(s as PlaySpeed)}
      />

      {/* Signal count badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-sm shadow-sm">
          <span className="font-mono text-[10px] text-[var(--ink-tertiary)]">Geographic View</span>
          <span className="w-px h-3 bg-[var(--border)]" />
          <span className="font-mono text-[10px] text-[var(--ink)]">
            {filteredSignals.length} signals · {assets.length} assets
          </span>
        </div>
      </div>
    </div>
  );
}
