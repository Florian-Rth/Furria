import type { Theme } from '@mui/material/styles';

export type CycleTint = 'red' | 'gold' | 'ink';

const TINT_CYCLE: readonly CycleTint[] = ['red', 'gold', 'ink'];

export const cycleTintAt = (index: number): CycleTint =>
  TINT_CYCLE[index % TINT_CYCLE.length] ?? 'red';

export const resolveCycleTint = (theme: Theme, index: number): string => {
  const palette = (theme.vars ?? theme).palette;
  const tints: Record<CycleTint, string> = {
    red: palette.primary.main,
    gold: palette.warning.main,
    ink: palette.text.primary,
  };
  return tints[cycleTintAt(index)];
};
