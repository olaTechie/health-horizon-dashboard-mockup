import { cn } from '@/lib/cn';

/**
 * Editorial empty state for filtered zero-result views in the Signal Explorer.
 * The radar sweep monoline is intentionally restrained — one slow rotation,
 * not a cute mascot. Reinforces the "we looked across the agent layer and
 * nothing met inclusion thresholds" methodological posture rather than
 * apologising for absence.
 */
export function EmptyRadar({
  variant = 'block',
  message = 'No signals meet the current filter criteria across the active scanning windows.',
  hint = 'Try widening the time horizon, clearing a region, or reviewing the watchlist tier.',
}: {
  variant?: 'block' | 'inline';
  message?: string;
  hint?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-5 text-center',
        variant === 'block' ? 'py-16 px-6' : 'py-10 px-6',
      )}
    >
      <svg
        viewBox="0 0 80 80"
        width={64}
        height={64}
        aria-hidden="true"
        className="text-[var(--ink-tertiary)]"
      >
        {/* concentric range rings */}
        <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.75" />
        <circle cx="40" cy="40" r="22" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.75" />
        <circle cx="40" cy="40" r="10" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.75" />
        {/* graticule cross */}
        <line x1="6" y1="40" x2="74" y2="40" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.5" />
        <line x1="40" y1="6" x2="40" y2="74" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.5" />
        {/* sweep — one slim wedge, monoline, infinite gentle rotation */}
        <g className="animate-radar-sweep" style={{ transformOrigin: '40px 40px' }}>
          <path
            d="M40 40 L40 6 A34 34 0 0 1 64.04 15.96 Z"
            fill="currentColor"
            fillOpacity="0.08"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="0.6"
          />
        </g>
        {/* center pivot */}
        <circle cx="40" cy="40" r="1.4" fill="currentColor" fillOpacity="0.6" />
      </svg>

      <div className="space-y-1.5 max-w-[420px]">
        <p className="text-sm text-[var(--ink-secondary)]">{message}</p>
        <p className="text-xs text-[var(--ink-tertiary)] font-mono uppercase tracking-wider">
          {hint}
        </p>
      </div>
    </div>
  );
}
