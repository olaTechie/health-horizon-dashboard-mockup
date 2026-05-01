import { ExternalLink } from 'lucide-react';
import { SourceTypeIcon } from '@/components/shared/SourceTypeIcon';
import { fmtDate } from '@/lib/format';
import type { SourceCitation, SourceType } from '@/lib/types';

const SOURCE_LABEL: Record<SourceType, string> = {
  'peer-reviewed': 'Peer-Reviewed Literature',
  'who-alert': 'WHO Disease Outbreak News',
  'regulatory': 'Regulatory & Standards',
  'industry': 'Industry Guidance',
  'environmental': 'Environmental Monitoring',
  'social': 'Social / Media Intelligence',
};

const TYPE_ORDER: SourceType[] = [
  'peer-reviewed',
  'who-alert',
  'regulatory',
  'industry',
  'environmental',
  'social',
];

function groupBy(sources: SourceCitation[]): Map<SourceType, SourceCitation[]> {
  const map = new Map<SourceType, SourceCitation[]>();
  for (const src of sources) {
    const arr = map.get(src.type) ?? [];
    arr.push(src);
    map.set(src.type, arr);
  }
  return map;
}

function CitationRow({ src }: { src: SourceCitation }) {
  const inner = (
    <div className="flex flex-col gap-0.5 py-2.5 px-3 rounded-md border border-hair hover:bg-[var(--panel)] transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-[var(--ink)] leading-snug flex-1">{src.title}</p>
        {src.url && (
          <ExternalLink
            size={12}
            className="shrink-0 mt-0.5 text-[var(--ink-tertiary)] group-hover:text-[var(--tier-watch)] transition-colors"
          />
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-mono text-[var(--ink-secondary)]">{src.publisher}</span>
        <span className="text-[var(--border)]">·</span>
        <span className="text-[10px] font-mono text-[var(--ink-tertiary)]">{src.identifier}</span>
        <span className="text-[var(--border)]">·</span>
        <span className="text-[10px] font-mono text-[var(--ink-tertiary)]">{fmtDate(src.date)}</span>
      </div>
    </div>
  );

  if (src.url) {
    return (
      <a href={src.url} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
}

export function SourceCitations({ sources }: { sources: SourceCitation[] }) {
  const grouped = groupBy(sources);

  return (
    <div className="flex flex-col gap-6">
      {TYPE_ORDER.filter((t) => grouped.has(t)).map((type) => {
        const items = grouped.get(type)!;
        return (
          <section key={type}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[var(--ink-secondary)]">
                <SourceTypeIcon type={type} size={14} />
              </span>
              <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--ink-secondary)]">
                {SOURCE_LABEL[type]}
              </h4>
              <span className="text-[10px] font-mono text-[var(--ink-tertiary)]">({items.length})</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {items.map((src, i) => (
                <li key={i}>
                  <CitationRow src={src} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
