import type { Brief } from '@/lib/types';

export const BRIEFS: Brief[] = [
  {
    id: 'BRIEF-2025-Q3',
    quarter: 'Q3 2025',
    publishedAt: '2025-09-30',
    abstract: 'Q3 2025 reflected an inflection in climate–health interfaces, with WBGT exceedances driving the first Action-tier signals on Permian summer operations, alongside a persistent Mpox watchlist now spanning two clades.',
    keyFindings: [
      'Climate-driven heat exposure emerged as the dominant Protect-pillar risk',
      'Mpox clade Ib watchlist re-classified to Attention',
      'NIOSH heat-stress NPRM moved to public comment phase',
      'Ageing offshore workforce capability gaps surfaced as cross-cutting Promote-pillar concern',
    ],
    thematicDeepDives: [
      { theme: 'Climate–Health: WBGT Thresholds in Onshore US Operations', summary: 'NIOSH-aligned WBGT exceedance modelling for Permian summer rotations.', signalIds: ['SIG-2026-Q2-025'] },
      { theme: 'Infectious Disease: Mpox Clade Ib Geographic Expansion', summary: 'Cross-border clusters in Central/East Africa.', signalIds: ['SIG-2026-Q2-001'] },
    ],
    watchlistSignalIds: ['SIG-2026-Q2-001', 'SIG-2026-Q2-009', 'SIG-2026-Q2-025', 'SIG-2026-Q2-033'],
    signedOffBy: [
      { name: 'Victor Adekanmbi, MD, PhD', role: 'Programme Lead, Health Horizon Scanning' },
      { name: 'Fangjian Guo, MD, PhD', role: 'Lead Methodologist, Evidence Synthesis' },
    ],
    pdfPath: '/briefs/2025-Q3.pdf',
  },
  {
    id: 'BRIEF-2025-Q4',
    quarter: 'Q4 2025',
    publishedAt: '2025-12-22',
    abstract: 'Q4 2025 was characterised by regulatory acceleration: NIOSH heat-stress NPRM advanced toward final rule, EU-OSHA tabled a draft psychosocial directive, and OEUK proposed material updates to medical fitness regimes affecting offshore mobilisation.',
    keyFindings: [
      'Three concurrent regulatory streams now converging on 2026 implementation windows',
      'PFAS firefighting foam phase-out audit triggered Action-tier review',
      'Marburg follow-on signals from Rwanda contained but watchlisted',
      'Cyclone medevac APAC corridor upgraded to Attention',
    ],
    thematicDeepDives: [
      { theme: 'Regulatory: NIOSH Heat-Stress NPRM Implementation Pathway', summary: 'Implications for Permian, QGC, and Pernis exterior maintenance.', signalIds: ['SIG-2026-Q2-017'] },
      { theme: 'Occupational Exposure: PFAS Firefighting Foam Phase-Out', summary: 'Cross-asset audit triggers and decommissioning exposure.', signalIds: ['SIG-2026-Q2-010'] },
    ],
    watchlistSignalIds: ['SIG-2026-Q2-010', 'SIG-2026-Q2-017', 'SIG-2026-Q2-018', 'SIG-2026-Q2-028'],
    signedOffBy: [
      { name: 'Victor Adekanmbi, MD, PhD', role: 'Programme Lead, Health Horizon Scanning' },
      { name: 'Fangjian Guo, MD, PhD', role: 'Lead Methodologist, Evidence Synthesis' },
    ],
    pdfPath: '/briefs/2025-Q4.pdf',
  },
  {
    id: 'BRIEF-2026-Q1',
    quarter: 'Q1 2026',
    publishedAt: '2026-03-31',
    abstract: 'Q1 2026 saw the Mpox watchlist escalate as cross-border clade Ib clusters expanded; concurrently a North America upstream suicide cluster signal triggered the first psychosocial Action-tier event of the programme.',
    keyFindings: [
      'Psychosocial domain produced its first Action-tier signal',
      'Mpox clade Ib formally tracked toward Action escalation',
      'Carbapenem-resistant Acinetobacter signals from India ICUs flagged for medevac protocol review',
      'EU CBAM occupational implications surfaced for Rotterdam cluster',
    ],
    thematicDeepDives: [
      { theme: 'Psychosocial: NA Upstream Cluster Surveillance', summary: 'Cluster surveillance methodology and intervention pathway.', signalIds: ['SIG-2026-Q2-039'] },
      { theme: 'AMR: Medevac Pathway Hospitals in High-Resistance Regions', summary: 'Triangulated PubMed and WHO data for revised medevac assumptions.', signalIds: ['SIG-2026-Q2-004'] },
    ],
    watchlistSignalIds: ['SIG-2026-Q2-001', 'SIG-2026-Q2-004', 'SIG-2026-Q2-039'],
    signedOffBy: [
      { name: 'Victor Adekanmbi, MD, PhD', role: 'Programme Lead, Health Horizon Scanning' },
      { name: 'Fangjian Guo, MD, PhD', role: 'Lead Methodologist, Evidence Synthesis' },
    ],
    pdfPath: '/briefs/2026-Q1.pdf',
  },
  {
    id: 'BRIEF-2026-Q2',
    quarter: 'Q2 2026',
    publishedAt: '2026-04-30',
    abstract: 'Q2 2026 marks two concurrent Action-tier escalations — Mpox clade Ib and NIOSH heat-stress final rule pathway — with material implications for medevac assumptions, summer rotation planning, and Permian/QGC exterior maintenance schedules.',
    keyFindings: [
      'Two Action-tier escalations live concurrently for the first time',
      'Mpox clade Ib confirmed in 6 non-endemic countries',
      'NIOSH heat-stress final rule expected within 90 days',
      'Eight Attention-tier signals across Protect and Access pillars',
      'Triangulation discipline maintained — no single-source escalations issued',
    ],
    thematicDeepDives: [
      { theme: 'Infectious: Mpox Clade Ib — Cross-Border Transmission', summary: 'Six-country footprint, IPIECA pandemic preparedness alignment.', signalIds: ['SIG-2026-Q2-001'] },
      { theme: 'Climate: WBGT Exceedance Permian Summer 2026', summary: 'Pre-final-rule operational guidance for exterior maintenance.', signalIds: ['SIG-2026-Q2-025'] },
      { theme: 'Regulatory: NIOSH Heat-Stress Final Rule Pathway', summary: 'Timing, scope, and Shell readiness assessment.', signalIds: ['SIG-2026-Q2-017'] },
    ],
    watchlistSignalIds: ['SIG-2026-Q2-001', 'SIG-2026-Q2-002', 'SIG-2026-Q2-017', 'SIG-2026-Q2-025', 'SIG-2026-Q2-039'],
    signedOffBy: [
      { name: 'Victor Adekanmbi, MD, PhD', role: 'Programme Lead, Health Horizon Scanning' },
      { name: 'Fangjian Guo, MD, PhD', role: 'Lead Methodologist, Evidence Synthesis' },
    ],
    pdfPath: '/briefs/2026-Q2.pdf',
  },
];
