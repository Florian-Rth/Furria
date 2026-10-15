import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import type { ForgeChip } from '../honour-forge';
import type { KkMetalGradient } from '../honour-laps';
import { chipTransition, FILL_BOX_ORIGIN } from '../honour-motion';
import { chipPaint } from '../honour-paint';

const CHIP_ASPECT = 0.55;
const CHIP_CORNER = 0.12;
const LAUNCH = { opacity: 0, x: 0, y: 0, rotate: 0 } as const;

interface KkHonourForgeChipProps {
  chip: ForgeChip;
  center: number;
  size: number;
  gradient: KkMetalGradient;
}

export const KkHonourForgeChip: FC<KkHonourForgeChipProps> = ({ chip, center, size, gradient }) => {
  const height = size * CHIP_ASPECT;
  const corner = size * CHIP_CORNER;
  const left = center - size / 2;
  const top = center - height / 2;
  const flight = { opacity: [0, 1, 0], x: chip.dx, y: chip.dy, rotate: chip.rotate };
  const transition = chipTransition(chip.delaySeconds);
  const paint = chipPaint(gradient, chip.paint);

  return (
    <Box
      component={motion.rect}
      x={left}
      y={top}
      width={size}
      height={height}
      rx={corner}
      initial={LAUNCH}
      animate={flight}
      transition={transition}
      style={FILL_BOX_ORIGIN}
      sx={paint}
    />
  );
};
