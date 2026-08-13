import type { Theme } from '@mui/material/styles';

export const resolveEventTypeTint = (theme: Theme, eventType: string): string => {
  const palette = (theme.vars ?? theme).palette;
  switch (eventType) {
    case 'Prunksitzung':
      return palette.primary.main;
    case 'Weiberfasching':
      return palette.warning.main;
    case 'Jugendfasching':
      return palette.info.main;
    case 'Kinderfasching':
      return palette.success.main;
    default:
      return palette.text.primary;
  }
};
