'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { parseFilterParams, serializeFilters } from '@/lib/filters';
import type { PPAPillar, Horizon } from '@/lib/types';
import { cn } from '@/lib/cn';

const PPA_OPTIONS: { id: PPAPillar; label: string }[] = [
  { id: 'promote', label: 'Promote' },
  { id: 'protect', label: 'Protect' },
  { id: 'access', label: 'Access' },
];
const HORIZON_OPTIONS: { id: Horizon; label: string }[] = [
  { id: 'immediate', label: '≤90d' },
  { id: '12mo', label: '12mo' },
  { id: '1-5yr', label: '1-5yr' },
];

export function GlobalFilters() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const filters = parseFilterParams(new URLSearchParams(params.toString()));

  const togglePpa = (p: PPAPillar) => {
    const cur = new Set(filters.ppas ?? []);
    if (cur.has(p)) { cur.delete(p); } else { cur.add(p); }
    push({ ...filters, ppas: Array.from(cur) });
  };
  const toggleHorizon = (h: Horizon) => {
    const cur = new Set(filters.horizons ?? []);
    if (cur.has(h)) { cur.delete(h); } else { cur.add(h); }
    push({ ...filters, horizons: Array.from(cur) });
  };
  const push = (next: ReturnType<typeof parseFilterParams>) => {
    const qs = serializeFilters(next);
    router.push(qs ? `${path}?${qs}` : path);
  };

  return (
    // < lg : hide PPA + horizon clusters (no room next to the hamburger);
    //       theme toggle still surfaces via a fixed bottom-right button below.
    // ≥ lg : full filter cluster + theme toggle, top-right.
    <div className="hidden lg:flex fixed right-6 top-4 z-30 items-center gap-2">
      <div className="flex items-center gap-1 rounded-md border border-hair bg-[var(--surface)] p-1">
        {PPA_OPTIONS.map((p) => {
          const on = filters.ppas?.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => togglePpa(p.id)}
              className={cn(
                'rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider',
                on ? `bg-[var(--ppa-${p.id})] text-white` : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]',
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-1 rounded-md border border-hair bg-[var(--surface)] p-1">
        {HORIZON_OPTIONS.map((h) => {
          const on = filters.horizons?.includes(h.id);
          return (
            <button
              key={h.id}
              onClick={() => toggleHorizon(h.id)}
              className={cn(
                'rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider',
                on ? 'bg-[var(--ink)] text-[var(--bg)]' : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]',
              )}
            >
              {h.label}
            </button>
          );
        })}
      </div>
      <ThemeToggle />
    </div>
  );
}
