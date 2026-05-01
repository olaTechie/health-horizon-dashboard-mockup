'use client';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const next = theme === 'editorial' ? 'ops' : 'editorial';
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} theme`}
      onClick={() => setTheme(next)}
      className="inline-flex items-center gap-2 rounded-md border border-hair px-3 py-1.5 text-xs font-mono uppercase tracking-wider hover:bg-[var(--panel)] transition-colors"
    >
      {theme === 'editorial' ? <Moon size={14} /> : <Sun size={14} />}
      <span>{theme === 'editorial' ? 'Ops' : 'Editorial'}</span>
    </button>
  );
}
