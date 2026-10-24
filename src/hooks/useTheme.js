import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'tally-theme';

// index.css already has full light/dark palettes keyed off a [data-theme]
// attribute on <html>, falling back to the OS preference when unset — this
// just drives that attribute and remembers the choice.
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing / storage disabled — theme just won't persist.
    }
  }, []);

  return { theme, setTheme };
}
