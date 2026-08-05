import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { deDE } from '@mui/x-date-pickers/locales';
import { de } from 'date-fns/locale';
import type { FC, PropsWithChildren } from 'react';
import { kkTheme } from './theme';

const germanPickerText = deDE.components.MuiLocalizationProvider.defaultProps.localeText;

export const KkThemeProvider: FC<PropsWithChildren> = ({ children }) => (
  <ThemeProvider theme={kkTheme} noSsr>
    <CssBaseline enableColorScheme />
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={de}
      localeText={germanPickerText}
    >
      {children}
    </LocalizationProvider>
  </ThemeProvider>
);
