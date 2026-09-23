import Box from '@mui/material/Box';
import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { DockChip } from './dock-chips';

const CHIP_COLOR = {
  red: 'primary.main',
  gold: 'warning.main',
} as const;

const PEAK_AT = 0.3;
const FADE_FROM = 0.62;
const APPEAR_AT = 0.06;
const SLIM_SHARE = 0.5;
const PERSPECTIVE = 600;

interface KonfettiDockChipProps {
  chip: DockChip;
  spread: number;
}

export const KonfettiDockChip: FC<KonfettiDockChipProps> = ({ chip, spread }) => {
  const flightStyle = {
    position: 'absolute' as const,
    left: chip.startShare * spread,
    top: 0,
    transformPerspective: PERSPECTIVE,
  };
  const flight = {
    x: [0, chip.driftX * 0.7, chip.driftX],
    y: [0, chip.peakY, chip.fallY],
    opacity: [0, 1, 1, 0],
    scale: [0.3, 1, 1],
    rotate: [0, chip.spinDegrees],
    rotateX: [0, chip.flipDegrees],
  };
  const timing: Transition = {
    duration: chip.durationSeconds,
    delay: chip.delaySeconds,
    x: {
      duration: chip.durationSeconds,
      delay: chip.delaySeconds,
      times: [0, PEAK_AT, 1],
      ease: 'easeOut',
    },
    y: {
      duration: chip.durationSeconds,
      delay: chip.delaySeconds,
      times: [0, PEAK_AT, 1],
      ease: ['easeOut', 'easeIn'],
    },
    opacity: {
      duration: chip.durationSeconds,
      delay: chip.delaySeconds,
      times: [0, APPEAR_AT, FADE_FROM, 1],
    },
    scale: { duration: chip.durationSeconds, delay: chip.delaySeconds, times: [0, PEAK_AT, 1] },
    ease: 'easeOut',
  };
  const height = chip.isSlim ? chip.size * SLIM_SHARE : chip.size;

  return (
    <motion.span style={flightStyle} animate={flight} transition={timing}>
      <Box
        component="span"
        sx={{
          display: 'block',
          width: chip.size,
          height,
          translate: '-50% -50%',
          borderRadius: chip.isRound ? '50%' : `${kkTokens.radius.bar}px`,
          bgcolor: CHIP_COLOR[chip.color],
        }}
      />
    </motion.span>
  );
};
