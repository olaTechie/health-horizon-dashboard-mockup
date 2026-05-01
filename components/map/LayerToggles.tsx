'use client';

import { Layers } from 'lucide-react';
import { cn } from '@/lib/cn';

interface LayerToggleItem {
  id: string;
  label: string;
  description: string;
  stub?: boolean;
}

const LAYERS: LayerToggleItem[] = [
  { id: 'assets', label: 'Asset dots', description: 'Shell operational sites sized by headcount' },
  { id: 'signal-density', label: 'Signal density', description: 'Heatmap of active signals by location' },
  { id: 'climate-zones', label: 'Climate zones', description: 'Köppen climate zone tint overlay', stub: true },
  { id: 'regulatory', label: 'Regulatory jurisdictions', description: 'Key regulatory boundary overlays', stub: true },
];

interface LayerTogglesProps {
  visibleLayers: Set<string>;
  onChange: (id: string) => void;
}

export function LayerToggles({ visibleLayers, onChange }: LayerTogglesProps) {
  return (
    <div className="absolute top-4 right-4 z-10 w-52 rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-sm shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--border)]">
        <Layers size={13} className="text-[var(--ink-secondary)]" />
        <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--ink-secondary)]">
          Layers
        </span>
      </div>

      {/* Toggles */}
      <div className="divide-y divide-[var(--border)]">
        {LAYERS.map((layer) => {
          const checked = visibleLayers.has(layer.id);
          return (
            <label
              key={layer.id}
              className={cn(
                'flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors',
                layer.stub
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[var(--panel)]',
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => !layer.stub && onChange(layer.id)}
                disabled={layer.stub}
                className="mt-0.5 size-3.5 accent-[var(--tier-watch)] shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-[var(--ink)]">{layer.label}</span>
                  {layer.stub && (
                    <span className="text-[9px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider rounded px-1 bg-[var(--panel)]">
                      stub
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[var(--ink-tertiary)] leading-tight block mt-0.5">
                  {layer.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
