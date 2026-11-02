import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactElement } from 'react';
import { goldInkOf } from '../internal/gold-ink';
import type { KkSx } from '../kk-sx';

export type KkScoreGlyphKind = 'movement' | 'video' | 'flag';
export type KkScoreGlyphSize = 'tiny' | 'small';

const SIZES: Record<KkScoreGlyphSize, string> = { tiny: '0.625rem', small: '0.875rem' };
const STROKE = 1.6;

const SHAPES: Record<KkScoreGlyphKind, ReactElement> = {
  movement: (
    <>
      <path d="M1.8 9.6C3.2 4.4 7.4 3 10.2 4.6" fill="none" strokeLinecap="round" />
      <path
        d="M7.4 2.6 10.4 4.7 8.2 7.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  video: (
    <>
      <rect x="1.2" y="2.8" width="9.6" height="6.4" rx="1.6" fill="none" />
      <path d="M5 4.6 7.8 6 5 7.4Z" data-kk-score-glyph-fill strokeLinejoin="round" />
    </>
  ),
  flag: (
    <>
      <path d="M6 1.4 11 10.4H1Z" fill="none" strokeLinejoin="round" />
      <path d="M6 4.6V7" fill="none" strokeLinecap="round" />
      <circle cx="6" cy="8.6" r="0.5" data-kk-score-glyph-fill />
    </>
  ),
};

const inkOf = (theme: Theme, kind: KkScoreGlyphKind, present: boolean): CSSObject => {
  if (!present) {
    return { color: (theme.vars ?? theme).palette.text.disabled, strokeDasharray: '1.4 1.6' };
  }

  return kind === 'flag' ? goldInkOf(theme) : { color: 'inherit' };
};

interface KkScoreGlyphProps {
  kind: KkScoreGlyphKind;
  present: boolean;
  size?: KkScoreGlyphSize;
  label?: string;
  sx?: KkSx;
}

export const KkScoreGlyph: FC<KkScoreGlyphProps> = ({
  kind,
  present,
  size = 'small',
  label,
  sx,
}) => (
  <Box
    component="svg"
    aria-hidden={label === undefined ? true : undefined}
    role={label === undefined ? undefined : 'img'}
    aria-label={label}
    viewBox="0 0 12 12"
    data-kk-score-glyph={kind}
    data-present={present}
    sx={[
      (theme) => ({
        width: SIZES[size],
        height: SIZES[size],
        flexShrink: 0,
        stroke: 'currentColor',
        strokeWidth: STROKE,
        '& [data-kk-score-glyph-fill]': { fill: 'currentColor', stroke: 'none' },
        ...inkOf(theme, kind, present),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {SHAPES[kind]}
  </Box>
);
