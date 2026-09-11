import type { Theme } from '@mui/material/styles';

export const inkWash = (theme: Theme, amount: string): string =>
  `color-mix(in srgb, ${(theme.vars ?? theme).palette.text.primary} ${amount}, transparent)`;
