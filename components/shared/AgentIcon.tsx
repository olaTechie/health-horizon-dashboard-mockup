import { Bug, FlaskConical, Scale, ThermometerSun, Brain } from 'lucide-react';
import type { AgentId } from '@/lib/types';

const MAP = {
  infectious: Bug,
  occupational: FlaskConical,
  regulatory: Scale,
  climate: ThermometerSun,
  psychosocial: Brain,
} as const;

export const AGENT_LABEL: Record<AgentId, string> = {
  infectious: 'Infectious Disease',
  occupational: 'Occupational Exposure',
  regulatory: 'Regulatory & Standards',
  climate: 'Climate–Health',
  psychosocial: 'Psychosocial Risk',
};

export function AgentIcon({ id, size = 16 }: { id: AgentId; size?: number }) {
  const Icon = MAP[id];
  return <Icon size={size} aria-label={AGENT_LABEL[id]} />;
}
