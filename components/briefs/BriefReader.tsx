'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import { fmtDate } from '@/lib/format';
import { assetUrl } from '@/lib/assetUrl';
import { TierDot } from '@/components/shared/TierBadge';
import { TierBadge } from '@/components/shared/TierBadge';
import type { Brief, Signal } from '@/lib/types';

interface BriefReaderProps {
  brief: Brief;
  signals: Signal[];
}

const METHODOLOGY_PROSE = `
Signal collection for each quarterly brief follows a structured, multi-source search protocol spanning eight primary surveillance channels: PubMed (peer-reviewed biomedical literature), WHO Disease Outbreak News, the European Centre for Disease Prevention and Control Rapid Risk Assessment repository, OEUK (formerly OGUK) occupational health bulletins, OSHA and NIOSH regulatory feeds, HSE (UK), IPIECA health guidance publications, and the IOGP HSSE data series. Preprint servers including bioRxiv and medRxiv are monitored for emerging findings in infectious disease, toxicology, and climate–health. Environmental and social signals draw on UNEP environmental health bulletins and peer-reviewed epidemiological surveillance journals.

Inclusion criteria require that a signal (a) demonstrates a plausible pathway to occupational or community health impact for Shell's rotating or resident workforce; (b) is corroborated by at least two independent source types; and (c) has been detected within the prior 180 days. Signals are excluded if evidence is limited to a single preprint without corroboration, or if the affected geography has no overlap with Shell's operational footprint. Confidence ratings are assigned as follows: High — ≥3 independent high-quality source types with consistent directionality; Moderate — 2 source types or mixed directionality; Low — emerging signal, single peer-reviewed source, or expert opinion only.

AI tools applied in this cycle include NLP entity extraction for rapid triage of PubMed and regulatory text, and an agentic AI orchestration layer that cross-maps signals to SEAM (Shell's Exposure-Action Matrix) categories and assigns provisional tier ratings for human expert review. All AI-assisted tier assignments are validated by a domain-specialist sign-off before publication. Limitations of this cycle include: (a) social surveillance coverage is constrained by platform-access restrictions; (b) APAC regulatory feeds have a mean 14-day lag versus EMEA/AMER sources; (c) bioRxiv preprint monitoring may surface signals that are subsequently retracted — these are flagged with a "preprint-only" confidence downgrade.
`.trim();

const BENCHMARKING_PROSE = `
Signals identified in this brief were assessed against the IOGP Health, Safety, Security and Environment (HSSE) performance indicator suite, with particular reference to Lost Time Injury Frequency (LTIF) and Total Recordable Case Frequency (TRCF) thresholds as published in the IOGP 2024 Safety Performance Indicators Report. Where applicable, signals were additionally cross-referenced against the IPIECA Health Performance Indicators (HPIs) — including occupational illness rates, malaria case rates, and food- and water-borne illness surveillance — to contextualise Shell's relative risk exposure within the broader upstream oil and gas peer group.

Maturity assessment across the five scanning domains found that Health Impact Assessment (HIA) practices — specifically structured pre-project HIA for new asset development in tropical and climate-vulnerable zones — remain the lowest-maturity dimension across the peer group. Shell's current protocol alignment with IPIECA HIA guidance is assessed at Tier 2 (established but not systematically integrated at project-finance stage). Psychosocial domain benchmarking against IPIECA guidance on mental health and well-being remains nascent across the industry; no peer-validated KPI baseline exists for the upstream offshore segment, and this brief flags that as a data gap requiring collaborative industry work.
`.trim();

export function BriefReader({ brief, signals }: BriefReaderProps) {
  const signalMap = new Map(signals.map((s) => [s.id, s]));

  return (
    <article
      className="max-w-[720px] mx-auto space-y-12 pb-24"
      aria-label={`${brief.quarter} brief reader`}
    >
      {/* ── 1. Executive Summary ── */}
      <section aria-labelledby="exec-summary">
        <h2
          id="exec-summary"
          className="font-display text-[40px] leading-tight text-[var(--ink)] mb-6"
          style={{ fontVariationSettings: '"opsz" 96' }}
        >
          Executive Summary
        </h2>

        {/* Abstract as editorial pull-quote */}
        <blockquote className="border-l-4 border-[var(--ink)]/20 pl-5 mb-6">
          <p className="italic text-[var(--ink-secondary)] text-[17px] leading-[1.7]">
            {brief.abstract}
          </p>
        </blockquote>

        {/* Key findings */}
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--ink-tertiary)] mb-3">
          Key Findings
        </h3>
        <ul className="space-y-2">
          {brief.keyFindings.map((finding, i) => (
            <li
              key={i}
              className="flex gap-3 text-[17px] leading-[1.7] text-[var(--ink)]"
            >
              <span className="font-mono text-sm text-[var(--ink-tertiary)] shrink-0 mt-0.5 w-5 text-right">
                {i + 1}.
              </span>
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 2. Methodology Transparency Note ── */}
      <section aria-labelledby="methodology">
        <h2
          id="methodology"
          className="font-display text-[40px] leading-tight text-[var(--ink)] mb-6"
          style={{ fontVariationSettings: '"opsz" 96' }}
        >
          Methodology Transparency Note
        </h2>
        <div className="space-y-4">
          {METHODOLOGY_PROSE.split('\n\n').map((para, i) => (
            <p key={i} className="text-[17px] leading-[1.7] text-[var(--ink-secondary)]">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* ── 3. Thematic Deep Dives ── */}
      <section aria-labelledby="thematic">
        <h2
          id="thematic"
          className="font-display text-[40px] leading-tight text-[var(--ink)] mb-6"
          style={{ fontVariationSettings: '"opsz" 96' }}
        >
          Thematic Deep Dives
        </h2>
        <div className="space-y-10">
          {brief.thematicDeepDives.map((dive) => (
            <div key={dive.theme}>
              <h3 className="font-sans text-xl font-semibold text-[var(--ink)] mb-2">
                {dive.theme}
              </h3>
              <p className="text-[17px] leading-[1.7] text-[var(--ink-secondary)] mb-4">
                {dive.summary}
              </p>
              {dive.signalIds.length > 0 && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-tertiary)] mb-2">
                    Cited signals
                  </p>
                  <ul className="space-y-2">
                    {dive.signalIds.map((sid) => {
                      const sig = signalMap.get(sid);
                      return (
                        <li key={sid}>
                          <Link
                            href={`/signals/${sid}`}
                            className="inline-flex items-center gap-2 text-sm text-[var(--ink)] hover:underline group"
                          >
                            <TierDot tier={sig?.tier ?? 'watch'} />
                            <span className="font-mono text-[var(--ink-tertiary)] text-xs">
                              {sid}
                            </span>
                            <span className="group-hover:text-[var(--tier-watch)]">
                              {sig?.title ?? sid}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Watchlist ── */}
      <section aria-labelledby="watchlist">
        <h2
          id="watchlist"
          className="font-display text-[40px] leading-tight text-[var(--ink)] mb-6"
          style={{ fontVariationSettings: '"opsz" 96' }}
        >
          Watchlist
        </h2>
        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--panel)] border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[var(--ink-tertiary)]">
                  ID
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[var(--ink-tertiary)]">
                  Title
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[var(--ink-tertiary)]">
                  Tier
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[var(--ink-tertiary)]">
                  Confidence
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[var(--ink-tertiary)]">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {brief.watchlistSignalIds.map((sid, i) => {
                const sig = signalMap.get(sid);
                return (
                  <tr
                    key={sid}
                    className={i % 2 === 0 ? 'bg-[var(--surface)]' : 'bg-[var(--panel)]/50'}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[var(--ink-tertiary)] whitespace-nowrap">
                      <Link
                        href={`/signals/${sid}`}
                        className="hover:underline text-[var(--tier-watch)]"
                      >
                        {sid}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--ink)] max-w-[280px]">
                      {sig ? (
                        <Link href={`/signals/${sid}`} className="hover:underline">
                          {sig.title}
                        </Link>
                      ) : (
                        <span className="text-[var(--ink-tertiary)]">{sid}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {sig ? <TierBadge tier={sig.tier} size="sm" /> : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs capitalize text-[var(--ink-secondary)]">
                      {sig?.confidence ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--ink-tertiary)] whitespace-nowrap">
                      {sig ? fmtDate(sig.lastUpdated) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. IOGP/IPIECA Benchmarking ── */}
      <section aria-labelledby="benchmarking">
        <h2
          id="benchmarking"
          className="font-display text-[40px] leading-tight text-[var(--ink)] mb-6"
          style={{ fontVariationSettings: '"opsz" 96' }}
        >
          IOGP / IPIECA Benchmarking
        </h2>
        <div className="space-y-4">
          {BENCHMARKING_PROSE.split('\n\n').map((para, i) => (
            <p key={i} className="text-[17px] leading-[1.7] text-[var(--ink-secondary)]">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* ── 6. Sign-off ── */}
      <section aria-labelledby="signoff">
        <h2
          id="signoff"
          className="font-display text-[40px] leading-tight text-[var(--ink)] mb-6"
          style={{ fontVariationSettings: '"opsz" 96' }}
        >
          Sign-off
        </h2>
        <div className="bg-[var(--panel)] rounded-xl border border-[var(--border)] p-6 space-y-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-tertiary)] mb-3">
              Signed off by
            </p>
            <ul className="space-y-2">
              {brief.signedOffBy.map((person, i) => (
                <li key={i} className="flex items-baseline gap-2">
                  <span className="font-semibold text-[var(--ink)] text-sm">{person.name}</span>
                  <span className="text-[var(--ink-tertiary)] text-sm">— {person.role}</span>
                </li>
              ))}
            </ul>
          </div>

          {brief.pdfPath && (
            <div className="pt-4 border-t border-[var(--border)]">
              <a
                href={assetUrl(brief.pdfPath)}
                download
                className="inline-flex items-center gap-2 rounded-md bg-[var(--ink)] text-[var(--bg)] px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tier-watch)]"
              >
                <Download className="size-4" aria-hidden="true" />
                Download print-ready PDF
              </a>
              <p className="mt-2 text-xs text-[var(--ink-tertiary)]">
                {brief.quarter} brief · Published {fmtDate(brief.publishedAt)}
              </p>
            </div>
          )}
        </div>
      </section>
    </article>
  );
}
