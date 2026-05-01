'use client';

import Link from 'next/link';
import { AgentIcon, AGENT_LABEL } from '@/components/shared/AgentIcon';
import { fmtRelative } from '@/lib/format';
import type { Agent } from '@/lib/types';

interface Props {
  agents: Agent[];
}

export function AgentGrid({ agents }: Props) {
  return (
    <section
      className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5"
      aria-label="Agent activity"
    >
      <h2 className="text-sm font-semibold text-[var(--ink)]">Agent Activity</h2>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-1">
        {agents.map((agent) => (
          <Link
            key={agent.id}
            href={`/signals?agent=${agent.id}`}
            className="group flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-3 transition-colors hover:border-[var(--tier-watch)] hover:bg-[var(--surface)]"
            aria-label={`${AGENT_LABEL[agent.id]} — ${agent.signalsOwned} signals, last run ${fmtRelative(agent.lastRunAt)}`}
          >
            {/* Pulse dot */}
            <div className="relative shrink-0">
              <div className="flex size-8 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--ink-secondary)] group-hover:text-[var(--ink)] transition-colors">
                <AgentIcon id={agent.id} size={15} />
              </div>
              {/* Activity pulse ring */}
              <span
                className="agent-pulse absolute -inset-0.5 rounded-full border border-[var(--tier-watch)] opacity-0"
                aria-hidden
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--ink)] truncate leading-tight">
                {agent.name}
              </p>
              <p className="font-mono text-[10px] text-[var(--ink-tertiary)] mt-0.5">
                Last run: {fmtRelative(agent.lastRunAt)}
              </p>
            </div>

            <span className="font-mono text-xl font-bold text-[var(--ink)] shrink-0">
              {agent.signalsOwned}
            </span>
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes agentPulse {
          0%, 100% { opacity: 0; transform: scale(0.95); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .agent-pulse {
          animation: agentPulse 1.4s ease-in-out infinite;
        }
        .group:hover .agent-pulse {
          opacity: 0.5;
        }
      `}</style>
    </section>
  );
}
