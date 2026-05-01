import { cn } from '@/lib/cn';
import type { AlertTier } from '@/lib/types';

const STYLE: Record<AlertTier, { bg: string; ink: string; label: string }> = {
  watch: { bg: 'bg-[var(--tier-watch)]', ink: 'text-white', label: 'Watch' },
  attention: { bg: 'bg-[var(--tier-attention)]', ink: 'text-white', label: 'Attention' },
  action: { bg: 'bg-[var(--tier-action)]', ink: 'text-white', label: 'Action' },
};

export function TierBadge({ tier, size = 'md' }: { tier: AlertTier; size?: 'sm' | 'md' }) {
  const s = STYLE[tier];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-mono uppercase tracking-wider',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        s.bg, s.ink,
      )}
    >
      <span className="size-1.5 rounded-full bg-white/80" />
      {s.label}
    </span>
  );
}

export function TierDot({ tier, pulse = false }: { tier: AlertTier; pulse?: boolean }) {
  return (
    <span className="relative inline-flex">
      <span className={cn('size-2.5 rounded-full', STYLE[tier].bg)} />
      {pulse && tier === 'action' && (
        <span className={cn('absolute inset-0 size-2.5 rounded-full animate-ping', STYLE[tier].bg, 'opacity-60')} />
      )}
    </span>
  );
}
