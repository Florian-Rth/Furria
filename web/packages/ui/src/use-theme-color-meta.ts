import { useLayoutEffect } from 'react';
import { kkThemeColorForScheme } from './theme-color';
import { useKkColorScheme } from './use-kk-color-scheme';

export const useThemeColorMeta = (): void => {
  const resolved = useKkColorScheme();

  useLayoutEffect(() => {
    const head = document.head;
    const existing = head.querySelector('meta[name="theme-color"]');
    const meta = existing ?? head.appendChild(document.createElement('meta'));
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', kkThemeColorForScheme(resolved));
  }, [resolved]);
};
