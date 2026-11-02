import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactElement } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';

export type KkScoreReadinessState = 'done' | 'open' | 'empty';

const SHAPES: Record<KkScoreReadinessState, ReactElement> = {
  done: (
    <>
      <circle cx="6" cy="6" r="5.2" data-fill />
      <path
        d="M3.4 6.2 5.2 8 8.7 4.2"
        data-cut
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  open: (
    <>
      <circle cx="6" cy="6" r="4.6" fill="none" />
      <path d="M6 1.4A4.6 4.6 0 0 1 6 10.6Z" data-fill />
    </>
  ),
  empty: <circle cx="6" cy="6" r="4.6" fill="none" strokeDasharray="2 1.8" />,
};

const inkOf = (theme: Theme, state: KkScoreReadinessState): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  if (state === 'open') {
    return goldInkOf(theme);
  }

  return { color: state === 'done' ? palette.text.primary : palette.text.disabled };
};

interface KkScoreReadinessMarkProps {
  state: KkScoreReadinessState;
}

export const KkScoreReadinessMark: FC<KkScoreReadinessMarkProps> = ({ state }) => (
  <Box
    component="svg"
    aria-hidden
    viewBox="0 0 12 12"
    data-kk-score-readiness-mark={state}
    sx={(theme) => ({
      width: '0.875rem',
      height: '0.875rem',
      flexShrink: 0,
      stroke: 'currentColor',
      strokeWidth: 1.5,
      '& [data-fill]': { fill: 'currentColor', stroke: 'none' },
      '& [data-cut]': { stroke: (theme.vars ?? theme).palette.background.paper, strokeWidth: 1.6 },
      ...inkOf(theme, state),
    })}
  >
    {SHAPES[state]}
  </Box>
);
