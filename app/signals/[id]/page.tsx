import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadSignals, loadAssets, loadAgents } from '@/lib/data';
import { StickyHeader } from '@/components/signal-detail/StickyHeader';
import { EvidenceTrail } from '@/components/signal-detail/EvidenceTrail';
import { SourceCitations } from '@/components/signal-detail/SourceCitations';
import { TriangulationDiagram } from '@/components/signal-detail/TriangulationDiagram';
import { AffectedAssets } from '@/components/signal-detail/AffectedAssets';
import { SidePanel } from '@/components/signal-detail/SidePanel';

export async function generateStaticParams() {
  const signals = await loadSignals();
  return signals.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const signals = await loadSignals();
  const signal = signals.find((s) => s.id === id);
  if (!signal) return { title: 'Signal Not Found' };
  return {
    title: `${signal.id} — ${signal.title} | Shell Health Horizon`,
    description: signal.summary,
  };
}

export default async function SignalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [signals, assets, agents] = await Promise.all([
    loadSignals(),
    loadAssets(),
    loadAgents(),
  ]);

  const signal = signals.find((s) => s.id === id);
  if (!signal) notFound();

  const agent = agents.find((a) => a.id === signal.agent);

  // 3 related signals: same agent, different id
  const relatedSignals = signals
    .filter((s) => s.agent === signal.agent && s.id !== signal.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <StickyHeader signal={signal} />

      {/* Page body */}
      <div className="px-8 py-10">
        <div className="grid grid-cols-3 gap-8">
          {/* Main column — col-span-2 */}
          <main className="col-span-2 flex flex-col gap-10">

            {/* Summary pull-quote */}
            <section>
              <blockquote className="border-l-2 border-[var(--tier-action)] pl-4 italic text-xl leading-relaxed text-[var(--ink)] max-w-[760px]">
                {signal.summary}
              </blockquote>
            </section>

            {/* Recommended Action call-out */}
            <section className="max-w-[760px]">
              <div className="border border-hair rounded-md bg-[var(--panel)] p-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--ink-tertiary)] mb-2">
                  Recommended Action
                </p>
                <p className="text-sm text-[var(--ink)] leading-relaxed mb-3">
                  {signal.recommendedAction}
                </p>
                {signal.seamMapping.length > 0 && (
                  <p className="text-[10px] font-mono text-[var(--ink-secondary)] uppercase tracking-wider">
                    <span className="text-[var(--ink-tertiary)]">SEAM: </span>
                    {signal.seamMapping.join(' · ')}
                  </p>
                )}
              </div>
            </section>

            {/* Evidence Trail */}
            <section className="max-w-[760px]">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--ink-tertiary)] mb-4">
                Evidence Trail
              </h2>
              <EvidenceTrail items={signal.evidenceTrail} />
            </section>

            {/* Source Citations + Triangulation */}
            <section className="max-w-[760px]">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--ink-tertiary)] mb-4">
                Source Citations
              </h2>
              <TriangulationDiagram sources={signal.sources} />
              <div className="mt-6">
                <SourceCitations sources={signal.sources} />
              </div>
            </section>

            {/* Affected Assets */}
            <section>
              <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--ink-tertiary)] mb-4">
                Affected Assets
              </h2>
              <AffectedAssets
                assetIds={signal.affectedAssets}
                allAssets={assets}
                regions={signal.regions}
              />
            </section>

          </main>

          {/* Side panel — col-span-1 */}
          <aside className="col-span-1">
            <div className="sticky top-[120px]">
              <SidePanel
                signal={signal}
                agent={agent}
                relatedSignals={relatedSignals}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
