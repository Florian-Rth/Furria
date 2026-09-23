import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { glassRingPaint } from '../logic/glass-skin';

const RING_STYLE = { position: 'absolute', inset: 0, transformOrigin: '30% 50%' } as const;
const RING_INITIAL = { scaleX: 0.6, scaleY: 0.4, opacity: 0 };
const RING_ANIMATE = { scaleX: 4.2, scaleY: 0.92, opacity: [0, 1, 0] };
const RING_SECONDS = 0.7;

interface GlassDropRingProps {
  delay: number;
}

export const GlassDropRing: FC<GlassDropRingProps> = ({ delay }) => {
  const transition = { duration: RING_SECONDS, delay, ease: 'easeOut' } as const;

  return (
    <motion.div
      style={RING_STYLE}
      initial={RING_INITIAL}
      animate={RING_ANIMATE}
      transition={transition}
    >
      <Box
        sx={[
          {
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            borderWidth: 1,
            borderStyle: 'solid',
          },
          glassRingPaint,
        ]}
      />
    </motion.div>
  );
};
