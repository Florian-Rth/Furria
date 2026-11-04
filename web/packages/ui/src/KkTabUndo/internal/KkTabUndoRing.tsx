import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { useState } from 'react';
import { keepsPlaying } from '../../internal/motion-override';
import { redInk } from '../../internal/red-ink';
import { stepFigures } from '../../KkStatePill/state-paint';

export type KkTabUndoRingSize = 'small' | 'large';

const VIEW = 40;
const CENTER = VIEW / 2;
const RADIUS = 17;

const EXTENTS: Record<KkTabUndoRingSize, string> = { small: '2.5rem', large: '6rem' };
const STROKES: Record<KkTabUndoRingSize, number> = { small: 3.2, large: 2.6 };
const NUMERALS: Record<KkTabUndoRingSize, 'h4' | 'h1'> = { small: 'h4', large: 'h1' };

const drain = keyframes`
  to {
    stroke-dashoffset: 1;
  }
`;

const ringPaint =
  (startOffset: number, seconds: number) =>
  (theme: Theme): CSSObject => ({
    display: 'block',
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
    '& [data-undo-track]': { fill: 'none', stroke: (theme.vars ?? theme).palette.divider },
    '& [data-undo-left]': {
      ...redInk(theme),
      fill: 'none',
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeDasharray: 1,
      strokeDashoffset: startOffset,
      animation: `${drain} ${seconds}s linear forwards`,
      ...keepsPlaying(true, seconds, 1),
    },
  });

interface KkTabUndoRingProps {
  remainingMs: number;
  windowMs: number;
  size: KkTabUndoRingSize;
}

export const KkTabUndoRing: FC<KkTabUndoRingProps> = ({ remainingMs, windowMs, size }) => {
  const [start] = useState(() => ({
    offset: 1 - Math.max(0, Math.min(1, remainingMs / windowMs)),
    seconds: Math.max(0, remainingMs) / 1000,
  }));
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));

  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        flexShrink: 0,
        width: EXTENTS[size],
        height: EXTENTS[size],
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        sx={ringPaint(start.offset, start.seconds)}
      >
        <circle data-undo-track cx={CENTER} cy={CENTER} r={RADIUS} strokeWidth={STROKES[size]} />
        <circle
          data-undo-left
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          strokeWidth={STROKES[size]}
          pathLength={1}
        />
      </Box>
      <Stack
        sx={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          component="span"
          sx={{ ...stepFigures, typography: NUMERALS[size], lineHeight: 1, color: 'text.primary' }}
        >
          {seconds}
        </Box>
      </Stack>
    </Box>
  );
};
