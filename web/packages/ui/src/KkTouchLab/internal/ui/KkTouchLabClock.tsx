import Typography from '@mui/material/Typography';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkTouchLabClockProps {
  time: MotionValue<string>;
  sx?: KkSx;
}

export const KkTouchLabClock: FC<KkTouchLabClockProps> = ({ time, sx }) => (
  <Typography
    variant="caption"
    component="p"
    sx={[
      { color: 'text.secondary', fontVariantNumeric: 'tabular-nums' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <motion.span>{time}</motion.span>
  </Typography>
);
