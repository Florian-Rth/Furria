import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { applyScheme, schemeFill } from '../../../internal/scheme-paint';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { kkTokens } from '../../../tokens';
import { useTileLanding } from '../logic/tile-context';
import { tileLandDelaySeconds } from '../logic/tile-land';
import { tileBreath } from '../tile-paint';

const FILL_AFTER_LAND_MS = 300;
const FILL_SECONDS = 1.1;
const FILL_EASE = [0.22, 0.61, 0.36, 1] as const;
const DOT = '0.5rem';
const BAR = 3;

const { light, dark } = kkTokens.color;

const trackPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  width: '100%',
  height: DOT,
  mt: 0.5,
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    top: `calc(50% - ${BAR / 2}px)`,
    height: BAR,
    borderRadius: `${kkTokens.radius.bar}px`,
    ...applyScheme(theme, schemeFill(light.line, dark.line)),
  },
});

const sweepPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  '& [data-fill]': {
    position: 'absolute',
    left: 0,
    right: 0,
    top: `calc(50% - ${BAR / 2}px)`,
    height: BAR,
    borderRadius: `${kkTokens.radius.bar}px`,
    ...redInk(theme),
    backgroundColor: 'currentColor',
  },
});

const dotPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  top: 0,
  left: `calc(100% - ${DOT} / 2)`,
  width: DOT,
  height: DOT,
  borderRadius: '50%',
  ...redInk(theme),
  backgroundColor: 'currentColor',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
    animation: `${tileBreath} 1.8s ease-in-out infinite`,
  },
});

interface KkStartTileProgressProps {
  progress: number;
}

export const KkStartTileProgress: FC<KkStartTileProgressProps> = ({ progress }) => {
  const { order } = useTileLanding();
  const reducedMotion = useReducedMotion();
  const share = Math.min(1, Math.max(0, progress));
  const transition = {
    duration: reducedMotion ? 0 : FILL_SECONDS,
    delay: reducedMotion ? 0 : tileLandDelaySeconds(order, FILL_AFTER_LAND_MS),
    ease: FILL_EASE,
  };
  const reach = `${share * 100}%`;

  return (
    <Box aria-hidden data-kk-start-tile-progress sx={trackPaint}>
      <Box
        component={motion.div}
        initial={{ width: reducedMotion ? reach : '0%' }}
        animate={{ width: reach }}
        transition={transition}
        sx={sweepPaint}
      >
        <Box data-fill />
        <Box sx={dotPaint} />
      </Box>
    </Box>
  );
};
