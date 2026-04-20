import { useState, useEffect } from 'react';
import { ThemeContext } from '@/hooks/useTheme';
import type { Theme } from '@/hooks/useTheme';

function applyTheme(theme: Theme) {
  const isDark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}

function getStoredTheme(): Theme {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'system';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  function setTheme(next: Theme) {
    setThemeState(next);
    if (next === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', next);
    }
    applyTheme(next);
  }

  // Listen for OS preference changes when in system mode
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    function onChange() {
      if (getStoredTheme() === 'system') applyTheme('system');
    }
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}
