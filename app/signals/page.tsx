import { loadSignals } from '@/lib/data';
import { SignalsExplorer } from '@/components/signals/SignalsExplorer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Signal Explorer — Shell Health Horizon',
  description: 'Filterable, sortable signal explorer for all health horizon signals.',
};

export default async function SignalsPage() {
  const signals = await loadSignals();
  return <SignalsExplorer initialSignals={signals} />;
}
