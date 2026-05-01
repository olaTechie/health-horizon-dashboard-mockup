import { cn } from '@/lib/cn';
import type { PPAPillar } from '@/lib/types';

const STYLE: Record<PPAPillar, { fg: string; ring: string; label: string }> = {
  promote: { fg: 'text-[var(--ppa-promote)]', ring: 'ring-[var(--ppa-promote)]/30', label: 'Promote' },
  protect: { fg: 'text-[var(--ppa-protect)]', ring: 'ring-[var(--ppa-protect)]/30', label: 'Protect' },
  access: { fg: 'text-[var(--ppa-access)]', ring: 'ring-[var(--ppa-access)]/30', label: 'Access' },
};

export function PpaChip({ pillar }: { pillar: PPAPillar }) {
  const s = STYLE[pillar];
  return (
    <span className={cn('inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ring-1', s.fg, s.ring)}>
      {s.label}
    </span>
  );
}
