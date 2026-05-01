'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TierBadge } from '@/components/shared/TierBadge';
import { PpaChip } from '@/components/shared/PpaChip';
import { AgentIcon, AGENT_LABEL } from '@/components/shared/AgentIcon';
import { fmtRelative } from '@/lib/format';
import type { Signal, Meta } from '@/lib/types';
import Link from 'next/link';

interface Props {
  signals: Signal[];
  meta: Meta;
}

export function HeroTicker({ signals, meta }: Props) {
  // Show Action signals first, then Attention
  const featured = [
    ...signals.filter((s) => s.tier === 'action'),
    ...signals.filter((s) => s.tier === 'attention'),
  ].slice(0, 5);

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || featured.length === 0) return;
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % featured.length);
    }, 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, featured.length]);

  if (featured.length === 0) return null;

  const current = featured[idx];

  return (
    <section
      className="relative rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden ops-grid"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured signal ticker"
    >
      {/* Header row */}
      <div className="flex flex-col gap-3 px-5 pt-6 pb-4 sm:px-8 sm:pt-8 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="font-display text-[clamp(26px,5vw,56px)] leading-[1.05] text-[var(--ink)] tracking-tight">
          Global Health Horizon — Q2 2026
        </h1>
        <span className="font-mono text-[11px] sm:text-xs text-[var(--ink-tertiary)] shrink-0 lg:ml-4 inline-flex items-center gap-2" title="Live monitoring is active">
          <span aria-hidden="true" className="relative inline-flex size-1.5">
            <span className="absolute inset-0 rounded-full bg-[var(--tier-watch)] animate-monitor-ping" />
            <span className="relative size-1.5 rounded-full bg-[var(--tier-watch)]" />
          </span>
          Last refreshed: {fmtRelative(meta.generatedAt)}
        </span>
      </div>

      {/* Animated signal */}
      <div className="relative min-h-[180px] sm:h-[140px] px-5 pb-6 sm:px-8 sm:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 px-5 pb-6 sm:px-8 sm:pb-8 flex flex-col justify-between"
          >
            <div className="flex flex-wrap items-start gap-2 mt-1 sm:gap-3">
              <TierBadge tier={current.tier} />
              {current.ppa.map((p) => (
                <PpaChip key={p} pillar={p} />
              ))}
              <span className="basis-full lg:basis-auto lg:ml-auto flex items-center gap-1.5 text-[11px] sm:text-xs text-[var(--ink-secondary)] font-mono">
                <AgentIcon id={current.agent} size={13} />
                {AGENT_LABEL[current.agent]}
              </span>
            </div>

            <Link
              href={`/signals/${current.id}`}
              className="group block mt-3"
            >
              <p className="text-lg font-semibold text-[var(--ink)] leading-snug group-hover:underline line-clamp-1">
                {current.title}
              </p>
              <p className="text-sm text-[var(--ink-secondary)] mt-1 line-clamp-2 leading-relaxed">
                {current.summary}
              </p>
            </Link>

            {/* Region tags + upd */}
            <div className="flex items-center gap-2 mt-3">
              {current.regions.map((r) => (
                <span
                  key={r}
                  className="font-mono text-[10px] text-[var(--ink-tertiary)] border border-[var(--border)] rounded px-1.5 py-0.5"
                >
                  {r}
                </span>
              ))}
              <span className="ml-auto font-mono text-[10px] text-[var(--ink-tertiary)]">
                Updated {fmtRelative(current.lastUpdated)}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Go to signal ${i + 1}`}
            className={`size-1.5 rounded-full transition-all duration-300 ${
              i === idx
                ? 'bg-[var(--ink)] w-4'
                : 'bg-[var(--border)]'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
