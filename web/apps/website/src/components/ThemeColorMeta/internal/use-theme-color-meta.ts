import { useColorScheme } from '@mui/material/styles';
import { useLayoutEffect } from 'react';
import { resolveColorMode } from '@/lib/color-mode';
import { themeColorForScheme } from './theme-color';

export const useThemeColorMeta = (): void => {
  const { mode, systemMode } = useColorScheme();
  const resolved = resolveColorMode(mode, systemMode);

  useLayoutEffect(() => {
    const head = document.head;
    const existing = head.querySelector('meta[name="theme-color"]');
    const meta = existing ?? head.appendChild(document.createElement('meta'));
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', themeColorForScheme(resolved));
  }, [resolved]);
};
