import { BookOpen, Globe, FileText, Building2, CloudSun, MessageCircle } from 'lucide-react';
import type { SourceType } from '@/lib/types';

const MAP = {
  'peer-reviewed': BookOpen,
  'who-alert': Globe,
  'regulatory': FileText,
  'industry': Building2,
  'environmental': CloudSun,
  'social': MessageCircle,
} as const;

export function SourceTypeIcon({ type, size = 14 }: { type: SourceType; size?: number }) {
  const Icon = MAP[type];
  return <Icon size={size} />;
}
