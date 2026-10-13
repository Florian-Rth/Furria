import type { Theme } from '@mui/material/styles';
import type { KkFilmPalette } from '../theme';

export const filmOf = (theme: Theme): KkFilmPalette => (theme.vars ?? theme).palette.film;
