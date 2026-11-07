import Box from '@mui/material/Box';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';

interface KkTimelineStripProps extends PropsWithChildren {
  x: MotionValue<number>;
  scale: MotionValue<number>;
  left: number;
  width: number;
  canvasWidth: number;
}

export const KkTimelineStrip: FC<KkTimelineStripProps> = ({
  x,
  scale,
  left,
  width,
  canvasWidth,
  children,
}) => (
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
    <Box
      data-kk-timeline-strip
      style={{ left, width }}
      sx={{ position: 'absolute', top: 0, bottom: 0, overflow: 'clip' }}
    >
      <Box
        style={{ left: -left, width: canvasWidth }}
        sx={{ position: 'absolute', top: 0, bottom: 0 }}
      >
        {children}
      </Box>
    </Box>
  </motion.div>
);
