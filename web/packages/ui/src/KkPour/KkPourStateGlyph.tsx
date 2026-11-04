import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { goldInkOf } from '../internal/gold-ink';
import { applyScheme, schemeInk } from '../internal/scheme-paint';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

export type KkPourTabState = 'open' | 'paid' | 'part' | 'overdue';

const GLYPH_SIZE = '1rem';

const statePaint: Record<KkPourTabState, (theme: Theme) => CSSObject> = {
  open: () => ({ color: 'text.primary' }),
  part: () => ({ color: 'text.primary' }),
  overdue: goldInkOf,
  paid: (theme) =>
    applyScheme(theme, schemeInk(kkTokens.color.light.greenInk, kkTokens.color.dark.greenInk)),
};

const ring = <circle cx={8} cy={8} r={6} fill="none" stroke="currentColor" strokeWidth={2} />;

const markOf = (state: KkPourTabState): ReactNode => {
  switch (state) {
    case 'open':
      return ring;
    case 'overdue':
      return (
        <>
          {ring}
          <path
            d="M8 4.8 V8.4 M8 10.9 V11"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      );
    case 'part':
      return (
        <>
          {ring}
          <path d="M8 2 A6 6 0 0 1 8 14 Z" fill="currentColor" />
        </>
      );
    default:
      return (
        <>
          <circle cx={8} cy={8} r={7} fill="currentColor" />
          <path
            data-kk-pour-check
            d="M4.8 8.2 L7 10.4 L11.2 5.8"
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
  }
};

const glyphPaint =
  (state: KkPourTabState) =>
  (theme: Theme): CSSObject => ({
    display: 'block',
    flexShrink: 0,
    width: GLYPH_SIZE,
    height: GLYPH_SIZE,
    ...statePaint[state](theme),
    '& [data-kk-pour-check]': { stroke: (theme.vars ?? theme).palette.background.paper },
  });

interface KkPourStateGlyphProps {
  state: KkPourTabState;
  sx?: KkSx;
}

export const KkPourStateGlyph: FC<KkPourStateGlyphProps> = ({ state, sx }) => {
  const mark = markOf(state);

  return (
    <Box
      component="svg"
      viewBox="0 0 16 16"
      aria-hidden
      sx={[glyphPaint(state), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {mark}
    </Box>
  );
};
