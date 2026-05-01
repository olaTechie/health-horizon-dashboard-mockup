import { loadAll } from '@/lib/data';
import { HeroTicker } from '@/components/dashboard/HeroTicker';
import { KpiStrip } from '@/components/dashboard/KpiStrip';
import { PpaBalance } from '@/components/dashboard/PpaBalance';
import { AgentGrid } from '@/components/dashboard/AgentGrid';
import { SnapshotMap } from '@/components/dashboard/SnapshotMap';
import { SignalFeed } from '@/components/dashboard/SignalFeed';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — Shell Health Horizon',
  description: 'Executive intelligence dashboard: live health signal tracker for Shell operations worldwide.',
};

export default async function DashboardPage() {
  const { signals, assets, agents, meta } = await loadAll();

  return (
    <div className="space-y-10 px-8 py-10">
      {/* Band 1 — Hero ticker */}
      <HeroTicker signals={signals} meta={meta} />

      {/* Band 2 — KPI strip */}
      <KpiStrip signals={signals} meta={meta} />

      {/* Band 3 — PPA balance + Agent grid (split row) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PpaBalance signals={signals} />
        <AgentGrid agents={agents} />
      </div>

      {/* Band 4 — Geographic snapshot */}
      <SnapshotMap signals={signals} assets={assets} />

      {/* Band 5 — Recent signal feed */}
      <SignalFeed signals={signals} />
    </div>
  );
}
