import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactElement } from 'react';
import { goldInkOf } from './internal/gold-ink';
import { redInk } from './internal/red-ink';
import type { KkSx } from './kk-sx';

export type KkSeverity = 'conflict' | 'hint' | 'met' | 'off';

type KkSeverityGlyphSize = 'small' | 'medium';

const VIEW = '0 0 12 12';
const STROKE = 1.5;
const SIZES: Record<KkSeverityGlyphSize, string> = { small: '0.75rem', medium: '0.9375rem' };

const goldGlyph = (theme: Theme): CSSObject => ({
  ...goldInkOf(theme),
  '& [data-kk-severity-fill]': { fill: (theme.vars ?? theme).palette.warning.main },
});

const redGlyph = (theme: Theme): CSSObject => ({
  ...redInk(theme),
  '& [data-kk-severity-mark]': {
    stroke: (theme.vars ?? theme).palette.background.paper,
    fill: (theme.vars ?? theme).palette.background.paper,
  },
});

const inks: Record<KkSeverity, (theme: Theme) => CSSObject> = {
  conflict: redGlyph,
  hint: goldGlyph,
  met: () => ({ color: 'success.main' }),
  off: () => ({ color: 'text.disabled' }),
};

const SHAPES: Record<KkSeverity, ReactElement> = {
  conflict: (
    <>
      <path
        d="M3.7 0.6h4.6l3.1 3.1v4.6l-3.1 3.1H3.7L0.6 8.3V3.7Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={0.6}
        strokeLinejoin="round"
      />
      <path data-kk-severity-mark d="M6 3.1v3.5" strokeWidth={1.6} strokeLinecap="round" />
      <circle data-kk-severity-mark cx={6} cy={8.7} r={0.95} />
    </>
  ),
  hint: (
    <path
      d="M6 1.6 10.8 10.2H1.2Z"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
  ),
  met: (
    <path
      d="M2.2 6.4 4.9 9 9.8 3.4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  off: (
    <path d="M2.5 6h7" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  ),
};

interface KkSeverityGlyphProps {
  state: KkSeverity;
  size?: KkSeverityGlyphSize;
  sx?: KkSx;
}

export const KkSeverityGlyph: FC<KkSeverityGlyphProps> = ({ state, size = 'small', sx }) => (
  <Box
    component="svg"
    aria-hidden
    viewBox={VIEW}
    data-kk-severity={state}
    sx={[
      { display: 'block', flexShrink: 0, width: SIZES[size], height: SIZES[size] },
      (theme) => inks[state](theme),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {SHAPES[state]}
  </Box>
);
