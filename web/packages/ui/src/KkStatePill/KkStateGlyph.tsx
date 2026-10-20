import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactElement } from 'react';
import type { KkSx } from '../kk-sx';
import type { KkStepState } from './step-state';

const VIEW = '0 0 12 12';
const STROKE = 1.75;
const GLYPH_SIZE = '0.75rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const glyphInk = (theme: Theme, state: KkStepState): CSSObject => {
  switch (state) {
    case 'done':
      return { color: palette(theme).text.primary };
    case 'current':
      return { color: palette(theme).primary.main };
    case 'overdue':
      return { color: palette(theme).warning.main };
    case 'open':
      return { color: palette(theme).text.secondary };
    case 'waiting':
      return { color: palette(theme).text.secondary };
    case 'off':
      return { color: palette(theme).text.disabled };
  }
};

const SHAPES: Record<KkStepState, ReactElement> = {
  done: (
    <path
      d="M2.6 6.3 5 8.6 9.4 3.6"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  overdue: <path d="M6 0.9 11.1 6 6 11.1 0.9 6Z" fill="currentColor" />,
  current: <circle cx="6" cy="6" r="3.4" fill="currentColor" />,
  open: <circle cx="6" cy="6" r="3.6" fill="none" stroke="currentColor" strokeWidth={1.5} />,
  waiting: (
    <g fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round">
      <circle cx="6" cy="6" r="4.6" />
      <path d="M6 3.5V6l1.7 1.1" />
    </g>
  ),
  off: (
    <path d="M3 6h6" fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
  ),
};

interface KkStateGlyphProps {
  state: KkStepState;
  sx?: KkSx;
}

export const KkStateGlyph: FC<KkStateGlyphProps> = ({ state, sx }) => (
  <Box
    component="svg"
    aria-hidden
    viewBox={VIEW}
    data-kk-state-glyph={state}
    sx={[
      { display: 'block', flexShrink: 0, width: GLYPH_SIZE, height: GLYPH_SIZE },
      (theme) => glyphInk(theme, state),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {SHAPES[state]}
  </Box>
);
