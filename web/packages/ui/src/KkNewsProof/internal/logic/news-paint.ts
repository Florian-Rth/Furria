import type { Theme } from '@mui/material/styles';
import type { KkNewsTone } from '../../news-proof-types';

export interface KkNewsPaint {
  fill: string;
  ink: string;
}

export const newsPaintOf = (theme: Theme, tone: KkNewsTone | null): KkNewsPaint => {
  const palette = (theme.vars ?? theme).palette;
  if (tone === null) {
    return { fill: palette.action.hover, ink: palette.text.secondary };
  }
  const paints: Record<KkNewsTone, KkNewsPaint> = {
    red: { fill: palette.primary.main, ink: palette.primary.contrastText },
    gold: { fill: palette.warning.main, ink: palette.warning.contrastText },
    ink: { fill: palette.text.primary, ink: palette.background.default },
  };
  return paints[tone];
};
