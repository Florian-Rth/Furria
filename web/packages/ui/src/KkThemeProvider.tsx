import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTheme } from './theme';

// The single way to mount the KK theme — app roots and test renderers share it,
// so theme and baseline configuration can never drift between app and tests.
// noSsr: every app is a client-only SPA, so the color-scheme mode can resolve
// synchronously on the first render instead of after an extra commit.
export const KkThemeProvider: FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider theme={kkTheme} noSsr>
    <CssBaseline enableColorScheme />
    {children}
  </ThemeProvider>
);
