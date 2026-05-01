import { cn } from '@/lib/cn';
import type { Confidence } from '@/lib/types';

const LEVELS: Confidence[] = ['low', 'moderate', 'high'];

export function ConfidenceMeter({ value }: { value: Confidence }) {
  const filled = LEVELS.indexOf(value) + 1;
  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn('h-3 w-1 rounded-sm', i <= filled ? 'bg-[var(--ink)]' : 'bg-[var(--border)]')} />
        ))}
      </div>
      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-secondary)]">{value}</span>
    </div>
  );
}
