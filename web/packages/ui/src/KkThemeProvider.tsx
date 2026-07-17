import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTheme } from './theme';

// The single way to mount the KK theme — app roots and test renderers share it,
// so theme and baseline configuration can never drift between app and tests.
export const KkThemeProvider: FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider theme={kkTheme}>
    <CssBaseline enableColorScheme />
    {children}
  </ThemeProvider>
);
