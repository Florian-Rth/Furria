import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { inkWash } from '../internal/ink-wash';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

const TRACK_HEIGHT = '0.25rem';
const FULL = { scaleX: 1 } as const;
const EMPTY = { scaleX: 0 } as const;

const trackPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  height: TRACK_HEIGHT,
  borderRadius: `${kkTokens.radius.pill}px`,
  backgroundColor: inkWash(theme, '12%'),
});

const fillPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  inset: 0,
  borderRadius: `${kkTokens.radius.pill}px`,
  transformOrigin: 'left',
  backgroundColor: (theme.vars ?? theme).palette.primary.main,
});

interface KkPourDrainProps {
  runKey: number;
  durationMs: number;
  sx?: KkSx;
}

export const KkPourDrain: FC<KkPourDrainProps> = ({ runKey, durationMs, sx }) => {
  const transition = { duration: durationMs / 1000, ease: 'linear' } as const;

  return (
    <Box aria-hidden data-kk-pour-drain sx={[trackPaint, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Box
        key={runKey}
        component={motion.span}
        initial={FULL}
        animate={EMPTY}
        transition={transition}
        sx={fillPaint}
      />
    </Box>
  );
};
