import type { Theme } from '@mui/material/styles';

type TouchLabPalette = (NonNullable<Theme['vars']> | Theme)['palette'];

export const touchLabPalette = (theme: Theme): TouchLabPalette => (theme.vars ?? theme).palette;
