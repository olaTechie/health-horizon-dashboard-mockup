'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListFilter, Map, BookText, Activity, Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ThemeToggle } from './ThemeToggle';

const ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/signals', label: 'Signals', icon: ListFilter },
  { href: '/map', label: 'Geographic', icon: Map },
  { href: '/briefs', label: 'Briefs', icon: BookText },
];

const isActive = (path: string | null, href: string) =>
  href === '/' ? path === '/' : !!path?.startsWith(href);

/**
 * Site navigation. Two presentations driven by the same item list:
 *   - Below `lg` (≥1024px) — slim top bar with a hamburger that opens a
 *     full-height drawer. Side rail is hidden so the 180px chrome doesn't
 *     consume half the viewport on phones / narrow tablets.
 *   - At `lg` and above — fixed left side rail, the original desktop layout.
 *
 * Both share the same `<Activity />` brand mark + active-state treatment so
 * the visual identity holds across breakpoints.
 */
export function SideRail() {
  const path = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer whenever the route changes — otherwise tapping a nav
  // item leaves it open over the new page.
  useEffect(() => {
    setDrawerOpen(false);
  }, [path]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <>
      {/* — Mobile / tablet top bar — */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-4 border-b border-hair bg-[var(--surface)]"
      >
        <Link href="/" className="flex items-center gap-2" aria-label="Shell Health Horizon — home">
          <Activity size={18} className="text-[var(--tier-action)]" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink-secondary)]">
            Shell Health Horizon
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label={drawerOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setDrawerOpen((v) => !v)}
            className="inline-flex items-center justify-center size-9 rounded-md hover:bg-[var(--panel)] transition-colors text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          >
            {drawerOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* — Mobile drawer — */}
      {drawerOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden fixed inset-0 z-30 pt-14"
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-[var(--ink)]/40"
          />
          <nav className="relative h-full w-full max-w-[320px] bg-[var(--surface)] border-r border-hair flex flex-col">
            <ul className="flex flex-col gap-1 px-3 py-5">
              {ITEMS.map(({ href, label, icon: Icon }) => {
                const active = isActive(path, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-4 py-3 text-base transition-colors',
                        active
                          ? 'bg-[var(--panel)] text-[var(--ink)]'
                          : 'text-[var(--ink-secondary)] hover:bg-[var(--panel)] hover:text-[var(--ink)]',
                      )}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto px-5 py-5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-tertiary)] border-t border-hair">
              v0.1 · prototype
            </div>
          </nav>
        </div>
      )}

      {/* — Desktop side rail — */}
      <nav
        aria-label="Primary"
        className="hidden lg:flex fixed left-0 top-0 z-30 h-screen w-[180px] flex-col border-r border-hair bg-[var(--surface)]"
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <Activity size={18} className="text-[var(--tier-action)]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink-secondary)]">SHH</span>
        </div>
        <ul className="flex flex-col gap-1 px-2">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(path, href);
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
    </>
  );
}
