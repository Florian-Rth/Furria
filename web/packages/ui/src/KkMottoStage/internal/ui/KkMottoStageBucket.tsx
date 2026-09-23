import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { BUCKET_LEFTOVERS, BUCKET_SPILL } from './bucket-spill';
import { KkMottoStageBucketPiece } from './KkMottoStageBucketPiece';

const VIEW_BOX = '0 0 720 180';
const WIDTH = { xs: '100%', desktop: '64%' };
const OPENING_OPACITY = { light: 0.72, dark: 0.9 } as const;
const MUTED_OPACITY = { light: 0.5, dark: 0.42 } as const;
const SHADOW_OPACITY = { light: 0.1, dark: 0.32 } as const;

const PIECES = [...BUCKET_LEFTOVERS, ...BUCKET_SPILL];

export const KkMottoStageBucket: FC = () => (
  <Box
    aria-hidden
    data-kk-motto-stage-bucket
    sx={{
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    <Box
      component="svg"
      viewBox={VIEW_BOX}
      preserveAspectRatio="xMaxYMax meet"
      sx={(theme) => {
        const palette = (theme.vars ?? theme).palette;

        return {
          position: 'absolute',
          right: 0,
          bottom: 0,
          height: '100%',
          width: WIDTH,
          opacity: MUTED_OPACITY.light,
          '& [data-tone="red"]': { color: palette.primary.main },
          '& [data-tone="gold"]': { color: palette.warning.main },
          '& [data-tone="ink"]': { color: palette.text.primary },
          '& [data-part="shadow"]': { fill: palette.common.black, opacity: SHADOW_OPACITY.light },
          '& [data-part="body"]': {
            fill: kkTokens.chrome.light.base,
            stroke: palette.text.primary,
          },
          '& [data-part="mouth"]': { fill: kkTokens.chrome.light.base },
          '& [data-part="band"]': { fill: palette.primary.main },
          '& [data-part="opening"]': {
            fill: palette.common.black,
            opacity: OPENING_OPACITY.light,
          },
          '& [data-part="rim"]': { fill: 'none', stroke: palette.text.primary },
          '& [data-part="handle"]': { fill: 'none', stroke: palette.text.secondary },
          ...theme.applyStyles('dark', {
            opacity: MUTED_OPACITY.dark,
            '& [data-part="body"]': { fill: kkTokens.chrome.dark.base },
            '& [data-part="mouth"]': { fill: kkTokens.chrome.dark.base },
            '& [data-part="shadow"]': { opacity: SHADOW_OPACITY.dark },
            '& [data-part="opening"]': { opacity: OPENING_OPACITY.dark },
          }),
        };
      }}
    >
      <ellipse data-part="shadow" cx={622} cy={170} rx={74} ry={6} />
      <path
        data-part="handle"
        d="M584 104C516 104 500 176 584 162"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <path
        data-part="body"
        d="M570 78L680 106A10 30 0 0 1 680 166L570 166"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      <path data-part="band" d="M605 87A8 39.5 0 0 1 605 166L625 166A7 37 0 0 0 625 92Z" />
      <ellipse data-part="mouth" cx={570} cy={122} rx={16} ry={44} />
      <ellipse data-part="opening" cx={570} cy={122} rx={16} ry={44} />
      <ellipse data-part="rim" cx={570} cy={122} rx={16} ry={44} strokeWidth={3} />
      {PIECES.map((piece) => (
        <KkMottoStageBucketPiece key={`${piece.x}-${piece.y}`} piece={piece} />
      ))}
    </Box>
  </Box>
);
