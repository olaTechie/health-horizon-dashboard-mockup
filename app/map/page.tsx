import type { Metadata } from 'next';
import { loadSignals, loadAssets } from '@/lib/data';
import { MapView } from '@/components/map/MapView';

export const metadata: Metadata = {
  title: 'Geographic View — Shell Health Horizon',
  description: 'Full-bleed world map showing Shell asset locations and active health signals by tier.',
};

export default async function MapPage() {
  const [signals, assets] = await Promise.all([loadSignals(), loadAssets()]);

  return (
    // Override the layout ml-[180px] + min-h-screen constraint so the map can fill the full viewport
    <div className="fixed inset-0 ml-[180px]">
      <MapView signals={signals} assets={assets} />
    </div>
  );
}
