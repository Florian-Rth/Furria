import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTheme } from './theme';

export const KkThemeProvider: FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider theme={kkTheme} noSsr>
    <CssBaseline enableColorScheme />
    {children}
  </ThemeProvider>
);
