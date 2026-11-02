import Box from '@mui/material/Box';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';

interface KkTouchLabStripProps extends PropsWithChildren {
  x: MotionValue<number>;
  scale: MotionValue<number>;
  left: number;
  width: number;
}

export const KkTouchLabStrip: FC<KkTouchLabStripProps> = ({ x, scale, left, width, children }) => (
  <motion.div
    style={{
      x,
      scaleX: scale,
      originX: 0,
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 0,
      willChange: 'transform',
      pointerEvents: 'none',
    }}
  >
    <Box style={{ left, width }} sx={{ position: 'absolute', top: 0, bottom: 0 }}>
      {children}
    </Box>
  </motion.div>
);
