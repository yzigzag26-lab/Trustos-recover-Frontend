import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
type Theme = 'light' | 'dark';
type ThemeContextValue = { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem('trustos-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch { return 'light'; }
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f7f6f2' : '#111715');
  }, [theme]);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      try { if (localStorage.getItem('trustos-theme')) return; } catch { /* follow system anyway */ }
      setThemeState(event.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try { localStorage.setItem('trustos-theme', next); } catch { /* Private browsing is fine. */ }
  }, []);
  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('trustos-theme', next); } catch { /* Private browsing is fine. */ }
      return next;
    });
  }, []);
  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be within ThemeProvider');
  return value;
}
