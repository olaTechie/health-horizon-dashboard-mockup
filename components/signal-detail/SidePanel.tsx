import Link from 'next/link';
import { AgentIcon, AGENT_LABEL } from '@/components/shared/AgentIcon';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import { TierDot } from '@/components/shared/TierBadge';
import type { Signal, Agent, Confidence, PPAPillar } from '@/lib/types';
import { fmtRelative } from '@/lib/format';
import { cn } from '@/lib/cn';

const CONFIDENCE_RATIONALE: Record<Confidence, string> = {
  high: 'Signal is corroborated by three or more independent authoritative sources with consistent findings across source types.',
  moderate: 'Signal is supported by two or more sources; some methodological heterogeneity or limited geographic corroboration remains.',
  low: 'Signal is based on early-stage evidence or a single source; expert judgement applied pending further triangulation.',
};

const PPA_IMPLICATIONS: Record<PPAPillar, (signal: Signal) => string> = {
  promote: (s) =>
    `Workforce health promotion programmes may need to address ${s.title.toLowerCase().includes('mental') || s.title.toLowerCase().includes('psychosocial') ? 'mental health and wellbeing' : 'awareness and prevention campaigns'} related to this signal.`,
  protect: (s) =>
    `Occupational health and safety controls for ${s.affectedAssets.length > 0 ? 'affected assets' : 'impacted sites'} should be reviewed against this signal's risk profile.`,
  access: (s) =>
    `Medical service delivery and healthcare access for ${s.regions.join(', ')} operations may be constrained or require enhancement in response to this signal.`,
};

const SEAM_COLORS = [
  'bg-[var(--ppa-promote)]/10 text-[var(--ppa-promote)]',
  'bg-[var(--ppa-protect)]/10 text-[var(--ppa-protect)]',
  'bg-[var(--ppa-access)]/10 text-[var(--ppa-access)]',
  'bg-[var(--tier-watch)]/10 text-[var(--tier-watch)]',
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-hair bg-[var(--surface)] p-4 flex flex-col gap-3">
      <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)]">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function SidePanel({
  signal,
  agent,
  relatedSignals,
}: {
  signal: Signal;
  agent: Agent | undefined;
  relatedSignals: Signal[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* 1. Confidence */}
      <Card title="Confidence Rating">
        <ConfidenceMeter value={signal.confidence} />
        <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
          {CONFIDENCE_RATIONALE[signal.confidence]}
        </p>
      </Card>

      {/* 2. Agent Provenance */}
      <Card title="Agent Provenance">
        {agent ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[var(--ink-secondary)]">
                <AgentIcon id={agent.id} size={16} />
              </span>
              <span className="text-sm font-medium text-[var(--ink)]">{agent.name}</span>
            </div>
            <p className="text-[10px] font-mono text-[var(--ink-tertiary)] uppercase tracking-wider">
              Last run: {fmtRelative(agent.lastRunAt)}
            </p>
            <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
              {agent.scanningDomain}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {agent.sourcesMonitored.map((s) => (
                <span
                  key={s}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--panel)] text-[var(--ink-secondary)] border border-hair"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--ink-tertiary)]">Agent data unavailable.</p>
        )}
      </Card>

      {/* 3. SEAM Mapping */}
      <Card title="SEAM Standard Mapping">
        {signal.seamMapping.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {signal.seamMapping.map((seam, idx) => (
              <li key={seam}>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-1 rounded text-[10px] font-mono',
                    SEAM_COLORS[idx % SEAM_COLORS.length],
                  )}
                >
                  {seam}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[var(--ink-tertiary)]">No SEAM mapping identified.</p>
        )}
      </Card>

      {/* 4. PPA Implications */}
      <Card title="PPA Pillar Implications">
        <ul className="flex flex-col gap-2">
          {signal.ppa.map((pillar) => (
            <li key={pillar} className="flex gap-2">
              <span
                className="mt-1 shrink-0 size-1.5 rounded-full"
                style={{ background: `var(--ppa-${pillar})` }}
              />
              <span className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                <span className="font-medium capitalize text-[var(--ink)]">{pillar}: </span>
                {PPA_IMPLICATIONS[pillar](signal)}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* 5. Related Signals */}
      <Card title="Related Signals">
        {relatedSignals.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {relatedSignals.map((rel) => (
              <li key={rel.id}>
                <Link
                  href={`/signals/${rel.id}`}
                  className="flex items-start gap-2 group hover:bg-[var(--panel)] -mx-2 px-2 py-1.5 rounded transition-colors"
                >
                  <span className="mt-0.5 shrink-0">
                    <TierDot tier={rel.tier} />
                  </span>
                  <span className="text-xs text-[var(--ink-secondary)] group-hover:text-[var(--ink)] leading-snug line-clamp-2 transition-colors">
                    {rel.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[var(--ink-tertiary)]">No related signals found.</p>
        )}
      </Card>
    </div>
  );
}
