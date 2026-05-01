export type AlertTier = 'watch' | 'attention' | 'action';
export type PPAPillar = 'promote' | 'protect' | 'access';
export type AgentId = 'infectious' | 'occupational' | 'regulatory' | 'climate' | 'psychosocial';
export type BusinessSegment = 'upstream' | 'integrated-gas' | 'downstream' | 'renewables';
export type Region = 'AMER' | 'EMEA' | 'APAC' | 'LATAM' | 'global';
export type Horizon = 'immediate' | '12mo' | '1-5yr';
export type Confidence = 'low' | 'moderate' | 'high';
export type SourceType = 'peer-reviewed' | 'who-alert' | 'regulatory' | 'industry' | 'environmental' | 'social';
export type ClimateZone = 'tropical' | 'arid' | 'temperate' | 'continental' | 'polar' | 'offshore';
export type HeadcountBand = '<100' | '100-500' | '500-2000' | '2000+';

export interface SourceCitation {
  type: SourceType;
  publisher: string;
  identifier: string;
  title: string;
  date: string;
  url?: string;
}

export interface EvidenceItem {
  date: string;
  agent: AgentId;
  event: string;
  detail: string;
}

export interface Signal {
  id: string;
  title: string;
  summary: string;
  tier: AlertTier;
  ppa: PPAPillar[];
  agent: AgentId;
  regions: Region[];
  affectedAssets: string[];
  affectedSegments: BusinessSegment[];
  horizon: Horizon;
  confidence: Confidence;
  firstDetected: string;
  lastUpdated: string;
  sources: SourceCitation[];
  triangulationCount: number;
  seamMapping: string[];
  recommendedAction: string;
  evidenceTrail: EvidenceItem[];
}

export interface ThematicDeepDive {
  theme: string;
  summary: string;
  signalIds: string[];
}

export interface BriefSignoff {
  name: string;
  role: string;
}

export interface Brief {
  id: string;
  quarter: string;
  publishedAt: string;
  abstract: string;
  keyFindings: string[];
  thematicDeepDives: ThematicDeepDive[];
  watchlistSignalIds: string[];
  signedOffBy: BriefSignoff[];
  pdfPath?: string;
}

export interface Asset {
  id: string;
  name: string;
  segment: BusinessSegment;
  region: Region;
  country: string;
  coords: [number, number];
  headcountBand: HeadcountBand;
  climateZone: ClimateZone;
}

export interface Agent {
  id: AgentId;
  name: string;
  scanningDomain: string;
  sourcesMonitored: string[];
  signalsOwned: number;
  lastRunAt: string;
}

export interface Meta {
  generatedAt: string;
  version: string;
  totals: { signals: number; briefs: number; assets: number; agents: number };
  uptimePct: number;
}
