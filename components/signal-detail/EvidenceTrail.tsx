import { AgentIcon } from '@/components/shared/AgentIcon';
import { fmtDate } from '@/lib/format';
import type { EvidenceItem } from '@/lib/types';
import { cn } from '@/lib/cn';

/** Map event labels to a colour context */
const EVENT_COLOR: Record<string, string> = {
  'NLP detection': 'bg-[var(--tier-watch)]',
  'Expert validation': 'bg-[var(--ppa-promote)]',
  Triangulation: 'bg-[var(--ppa-protect)]',
  'Tier escalation': 'bg-[var(--tier-attention)]',
  'WHO confirmation': 'bg-[var(--tier-attention)]',
  'Regulatory detection': 'bg-[var(--ppa-access)]',
  'Internal sampling': 'bg-[var(--ppa-access)]',
  'Routine review': 'bg-[var(--ink-tertiary)]',
};

function nodeColor(event: string): string {
  for (const key of Object.keys(EVENT_COLOR)) {
    if (event.toLowerCase().includes(key.toLowerCase())) return EVENT_COLOR[key];
  }
  return 'bg-[var(--ink-tertiary)]';
}

export function EvidenceTrail({ items }: { items: EvidenceItem[] }) {
  return (
    <div className="relative">
      {/* vertical connector line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--border)]" />

      <ol className="flex flex-col gap-0">
        {items.map((item, idx) => (
          <li key={idx} className="relative flex gap-4 pb-6 last:pb-0">
            {/* circle node */}
            <div className="relative z-10 mt-1 shrink-0">
              <span
                className={cn(
                  'flex size-3.5 items-center justify-center rounded-full ring-2 ring-[var(--surface)]',
                  nodeColor(item.event),
                )}
              />
            </div>

            {/* content */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <time className="font-mono text-[10px] text-[var(--ink-tertiary)] uppercase tracking-wider">
                  {fmtDate(item.date)}
                </time>
                <span className="inline-flex items-center gap-1 text-[var(--ink-secondary)]">
                  <AgentIcon id={item.agent} size={11} />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-secondary)] font-semibold">
                  {item.event}
                </span>
              </div>
              <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
