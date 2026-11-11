import type { Theme } from '@mui/material/styles';

export type KkOrbitTone = 'green' | 'gold' | 'blue';

export const orbitToneColor = (theme: Theme, tone: KkOrbitTone): string => {
  const palette = (theme.vars ?? theme).palette;
  const colorByTone: Record<KkOrbitTone, string> = {
    green: palette.success.main,
    gold: palette.warning.main,
    blue: palette.info.main,
  };

  return colorByTone[tone];
};
