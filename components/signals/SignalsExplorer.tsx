'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Download, Table2, LayoutGrid, GitBranchPlus, Command } from 'lucide-react';
import { applyFilters, parseFilterParams, serializeFilters } from '@/lib/filters';
import type { FilterState } from '@/lib/filters';
import type { Signal } from '@/lib/types';
import { FacetRail } from '@/components/signals/FacetRail';
import { SignalsTable } from '@/components/signals/SignalsTable';
import type { SortKey, SortDir } from '@/components/signals/SignalsTable';
import { SignalsCardGrid } from '@/components/signals/SignalsCardGrid';
import { SignalsTimeline } from '@/components/signals/SignalsTimeline';
import { QuickPeek } from '@/components/signals/QuickPeek';
import { CmdPalette } from '@/components/signals/CmdPalette';

type ViewMode = 'table' | 'card' | 'timeline';

function buildCsvBlob(signals: Signal[]): Blob {
  const header = 'id,title,tier,ppa,agent,regions,confidence,firstDetected,lastUpdated';
  const rows = signals.map((s) =>
    [
      s.id,
      `"${s.title.replace(/"/g, '""')}"`,
      s.tier,
      `"${s.ppa.join(';')}"`,
      s.agent,
      `"${s.regions.join(';')}"`,
      s.confidence,
      s.firstDetected,
      s.lastUpdated,
    ].join(',')
  );
  return new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
}

interface SignalsExplorerInnerProps {
  initialSignals: Signal[];
}

function SignalsExplorerInner({ initialSignals }: SignalsExplorerInnerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Derive state from URL
  const filters: FilterState = parseFilterParams(searchParams);
  const view: ViewMode = (searchParams.get('view') as ViewMode | null) ?? 'table';
  const sortKey: SortKey = (searchParams.get('sort') as SortKey | null) ?? 'lastUpdated';
  const sortDir: SortDir = (searchParams.get('dir') as SortDir | null) ?? 'desc';
  const searchValue = filters.search ?? '';

  // Cmd-K handler
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const filteredSignals = applyFilters(initialSignals, filters);

  function updateUrl(next: Partial<{
    filters: FilterState;
    view: ViewMode;
    sort: SortKey;
    dir: SortDir;
  }>) {
    const newFilters = next.filters ?? filters;
    const newView = next.view ?? view;
    const newSort = next.sort ?? sortKey;
    const newDir = next.dir ?? sortDir;

    const qs = serializeFilters(newFilters);
    const p = new URLSearchParams(qs);
    if (newView !== 'table') p.set('view', newView);
    if (newSort !== 'lastUpdated') p.set('sort', newSort);
    if (newDir !== 'desc') p.set('dir', newDir);
    router.push(`/signals${p.toString() ? `?${p.toString()}` : ''}`);
  }

  function handleSearch(val: string) {
    updateUrl({ filters: { ...filters, search: val || undefined } });
  }

  function handleViewChange(v: ViewMode) {
    updateUrl({ view: v });
  }

  function handleSort(key: SortKey) {
    const newDir: SortDir = key === sortKey ? (sortDir === 'asc' ? 'desc' : 'asc') : 'desc';
    updateUrl({ sort: key, dir: newDir });
  }

  function handleExportCsv() {
    const blob = buildCsvBlob(filteredSignals);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shell-health-signals.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleHover = useCallback((signal: Signal | null) => {
    setSelectedSignal(signal);
  }, []);

  const viewIcons = [
    { id: 'table' as ViewMode, label: 'Table view', Icon: Table2 },
    { id: 'card' as ViewMode, label: 'Card view', Icon: LayoutGrid },
    { id: 'timeline' as ViewMode, label: 'Timeline view', Icon: GitBranchPlus },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Page header */}
      <div className="px-8 py-5 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-[var(--ink)]">
              Signal Explorer
            </h1>
            <p className="text-xs text-[var(--ink-tertiary)] mt-0.5">
              {filteredSignals.length} of {initialSignals.length} signals
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {/* Cmd-K button */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:border-[var(--ink-tertiary)] transition-colors"
              aria-label="Open command palette (Cmd+K)"
            >
              <Command size={13} />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline font-mono text-[9px] bg-[var(--surface)] border border-[var(--border)] rounded px-1 py-0.5">
                ⌘K
              </kbd>
            </button>

            {/* Search input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)] pointer-events-none" />
              <input
                type="search"
                placeholder="Filter signals…"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--panel)] pl-8 pr-3 py-2 text-xs text-[var(--ink)] placeholder:text-[var(--ink-tertiary)] outline-none focus:border-[var(--tier-watch)] transition-colors w-44"
                aria-label="Search signals"
              />
            </div>

            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-[var(--border)] overflow-hidden" role="group" aria-label="View mode">
              {viewIcons.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => handleViewChange(id)}
                  className={[
                    'flex items-center justify-center px-3 py-2 transition-colors',
                    view === id
                      ? 'bg-[var(--tier-watch)] text-white'
                      : 'bg-[var(--panel)] text-[var(--ink-secondary)] hover:text-[var(--ink)]',
                  ].join(' ')}
                  aria-label={label}
                  aria-pressed={view === id}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:border-[var(--ink-tertiary)] transition-colors"
              aria-label="Export signals as CSV"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Facet Rail */}
        <FacetRail
          signals={initialSignals}
          filters={filters}
        />

        {/* Content pane */}
        <div className="flex flex-1 min-w-0 overflow-hidden">
          {view === 'table' ? (
            <SignalsTable
              signals={filteredSignals}
              onHover={handleHover}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
            />
          ) : view === 'card' ? (
            <SignalsCardGrid
              signals={filteredSignals}
              onHover={handleHover}
            />
          ) : (
            <SignalsTimeline
              signals={filteredSignals}
              onHover={handleHover}
            />
          )}

          {/* Quick Peek */}
          <QuickPeek signal={selectedSignal} />
        </div>
      </div>

      {/* Command palette */}
      <CmdPalette
        signals={initialSignals}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  );
}

export function SignalsExplorer({ initialSignals }: SignalsExplorerInnerProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64 text-[var(--ink-tertiary)] text-sm">
        Loading…
      </div>
    }>
      <SignalsExplorerInner initialSignals={initialSignals} />
    </Suspense>
  );
}
