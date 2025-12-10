'use client';

import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface FavoriteStop {
  stop: string;
  name?: string;
}

export const getTheme = (): boolean => !!localStorage.getItem('ets_theme');

export const saveThemeLS = (theme: boolean) => (theme
  ? localStorage.setItem('ets_theme', '1')
  : localStorage.removeItem('ets_theme'));

type CtxType = [boolean, ((theme: boolean) => void)];

// eslint-disable-next-line no-spaced-func
const ThemeContext = createContext<CtxType | null>(null);
export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const [thm, setThm] = useState<boolean>(false);
  const setTheme = useCallback((theme: boolean) => {
    saveThemeLS(theme);
    const useDark = theme;
    if (useDark) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      setThm(true);
    } else {
      document.documentElement.removeAttribute('data-bs-theme');
      setThm(false);
    }
  }, []);

  useEffect(() => {
    setTheme(getTheme());
  }, [setTheme]);

  useEffect(() => {
    const onLSChange = (ev: StorageEvent) => {
      if (ev.key === 'ets_theme') {
        setTheme(getTheme());
      }
    };
    window.addEventListener('storage', onLSChange);
    return () => window.removeEventListener('storage', onLSChange);
  }, [setTheme]);

  const value = useMemo<CtxType>(() => [thm, setTheme], [thm, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
