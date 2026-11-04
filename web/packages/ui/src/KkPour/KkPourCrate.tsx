import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { applyScheme, schemeInk } from '../internal/scheme-paint';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

export type KkPourCrateSize = 'glyph' | 'tile' | 'hero' | 'stage';

export type KkPourCrateTone = 'ink' | 'accent' | 'faint';

const WIDTHS: Record<KkPourCrateSize, string> = {
  glyph: '1.25rem',
  tile: '1.75rem',
  hero: '8rem',
  stage: '100%',
};

const STROKES: Record<KkPourCrateSize, number> = { glyph: 4, tile: 3.5, hero: 1.5, stage: 1.25 };

const NECKS = [9, 21, 33, 45] as const;

const tonePaint =
  (tone: KkPourCrateTone) =>
  (theme: Theme): CSSObject => {
    if (tone === 'accent') {
      return applyScheme(theme, schemeInk(kkTokens.color.light.redInk, kkTokens.color.dark.redInk));
    }

    return { color: tone === 'faint' ? 'text.disabled' : 'text.primary' };
  };

interface KkPourCrateProps {
  filled: boolean;
  size?: KkPourCrateSize;
  tone?: KkPourCrateTone;
  sx?: KkSx;
}

export const KkPourCrate: FC<KkPourCrateProps> = ({ filled, size = 'glyph', tone = 'ink', sx }) => {
  const stroke = STROKES[size];
  const dash = filled ? undefined : '5 4';
  const bottles = filled
    ? NECKS.map((x) => (
        <g key={x}>
          <rect x={x + 1.5} y={4} width={7} height={14} rx={2} fill="currentColor" opacity={0.5} />
          <rect x={x + 2.5} y={1.5} width={5} height={4} rx={1.25} fill="currentColor" />
        </g>
      ))
    : null;

  return (
    <Box
      component="svg"
      viewBox="0 0 64 50"
      aria-hidden
      data-kk-pour-crate
      data-filled={filled}
      sx={[
        (theme) => ({
          display: 'block',
          flexShrink: 0,
          width: WIDTHS[size],
          height: 'auto',
          overflow: 'visible',
          ...tonePaint(tone)(theme),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {bottles}
      <rect
        x={2}
        y={14}
        width={60}
        height={34}
        rx={5}
        fill="currentColor"
        fillOpacity={filled ? 0.14 : 0}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={dash}
      />
      <rect
        x={21}
        y={20}
        width={22}
        height={7}
        rx={3.5}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={dash}
      />
      <path
        d="M8 36 H56"
        stroke="currentColor"
        strokeWidth={stroke * 0.7}
        strokeLinecap="round"
        opacity={filled ? 0.55 : 0.35}
      />
    </Box>
  );
};
