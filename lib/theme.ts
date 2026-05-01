'use client';
import { useEffect, useState } from 'react';

export type Theme = 'editorial' | 'ops';
const KEY = 'shh-theme';

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>('editorial');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem(KEY)) as Theme | null;
    if (saved === 'editorial' || saved === 'ops') setThemeState(saved);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    localStorage.setItem(KEY, t);
  };

  return [theme, setTheme];
}
