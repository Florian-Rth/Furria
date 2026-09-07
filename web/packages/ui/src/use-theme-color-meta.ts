import { useColorScheme } from '@mui/material/styles';
import { useLayoutEffect } from 'react';
import { kkThemeColorForScheme, resolveKkColorScheme } from './theme-color';

export const useThemeColorMeta = (): void => {
  const { mode, systemMode } = useColorScheme();
  const resolved = resolveKkColorScheme(mode, systemMode);

  useLayoutEffect(() => {
    const head = document.head;
    const existing = head.querySelector('meta[name="theme-color"]');
    const meta = existing ?? head.appendChild(document.createElement('meta'));
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', kkThemeColorForScheme(resolved));
  }, [resolved]);
};
