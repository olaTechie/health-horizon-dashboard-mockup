import type { Metadata } from 'next';
import { loadBriefs, loadSignals } from '@/lib/data';
import { BriefsArchive } from '@/components/briefs/BriefsArchive';

export const metadata: Metadata = {
  title: 'Briefs Archive — Shell Health Horizon',
  description: 'Quarterly health horizon intelligence briefs — executive summaries, thematic deep dives, and watchlist signals.',
};

export default async function BriefsPage() {
  const [briefs, signals] = await Promise.all([loadBriefs(), loadSignals()]);

  // Sort briefs by publishedAt descending (most recent first)
  const sortedBriefs = [...briefs].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return <BriefsArchive briefs={sortedBriefs} signals={signals} />;
}
