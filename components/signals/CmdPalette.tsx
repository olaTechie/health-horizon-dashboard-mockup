'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { X, Search } from 'lucide-react';
import { TierDot } from '@/components/shared/TierBadge';
import { AGENT_LABEL } from '@/components/shared/AgentIcon';
import type { Signal } from '@/lib/types';

interface CmdPaletteProps {
  signals: Signal[];
  open: boolean;
  onClose: () => void;
}

export function CmdPalette({ signals, open, onClose }: CmdPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  function selectSignal(id: string) {
    onClose();
    router.push(`/signals/${id}`);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Signal command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden">
        <Command label="Signal search" shouldFilter={false}>
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
            <Search size={16} className="shrink-0 text-[var(--ink-tertiary)]" />
            <Command.Input
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder="Search signals by ID or title…"
              className="flex-1 bg-transparent text-sm text-[var(--ink)] placeholder:text-[var(--ink-tertiary)] outline-none"
              aria-label="Search signals"
            />
            <button
              onClick={onClose}
              className="text-[var(--ink-tertiary)] hover:text-[var(--ink)] transition-colors"
              aria-label="Close palette"
            >
              <X size={16} />
            </button>
          </div>

          {/* Results list */}
          <Command.List className="max-h-72 overflow-y-auto py-1">
            <Command.Empty className="py-8 text-center text-sm text-[var(--ink-tertiary)]">
              No signals found.
            </Command.Empty>

            {signals
              .filter((s) => {
                if (!query) return true;
                const q = query.toLowerCase();
                return s.id.toLowerCase().includes(q) || s.title.toLowerCase().includes(q);
              })
              .slice(0, 12)
              .map((signal) => (
                <Command.Item
                  key={signal.id}
                  value={`${signal.id} ${signal.title}`}
                  onSelect={() => selectSignal(signal.id)}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[var(--panel)] aria-selected:bg-[var(--panel)] transition-colors"
                >
                  <TierDot tier={signal.tier} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--ink)] truncate">{signal.title}</p>
                    <p className="text-[10px] font-mono text-[var(--ink-tertiary)]">
                      {signal.id} · {AGENT_LABEL[signal.agent]}
                    </p>
                  </div>
                </Command.Item>
              ))}
          </Command.List>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-[var(--border)] flex items-center gap-4 text-[10px] font-mono text-[var(--ink-tertiary)]">
            <span><kbd className="rounded border border-[var(--border)] px-1 py-0.5">↑↓</kbd> navigate</span>
            <span><kbd className="rounded border border-[var(--border)] px-1 py-0.5">↵</kbd> open</span>
            <span><kbd className="rounded border border-[var(--border)] px-1 py-0.5">Esc</kbd> close</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
