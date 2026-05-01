'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListFilter, Map, BookText, Activity } from 'lucide-react';
import { cn } from '@/lib/cn';

const ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/signals', label: 'Signals', icon: ListFilter },
  { href: '/map', label: 'Geographic', icon: Map },
  { href: '/briefs', label: 'Briefs', icon: BookText },
];

export function SideRail() {
  const path = usePathname();
  return (
    <nav className="fixed left-0 top-0 z-30 flex h-screen w-[180px] flex-col border-r border-hair bg-[var(--surface)]">
      <div className="flex items-center gap-2 px-5 py-5">
        <Activity size={18} className="text-[var(--tier-action)]" />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink-secondary)]">SHH</span>
      </div>
      <ul className="flex flex-col gap-1 px-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-[var(--panel)] text-[var(--ink)]'
                    : 'text-[var(--ink-secondary)] hover:bg-[var(--panel)] hover:text-[var(--ink)]',
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto px-5 py-5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-tertiary)]">
        v0.1 · prototype
      </div>
    </nav>
  );
}
