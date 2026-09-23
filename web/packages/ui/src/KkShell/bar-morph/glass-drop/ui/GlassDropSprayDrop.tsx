import Box from '@mui/material/Box';
import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { GlassSprayDrop } from '../logic/glass-drop-paths';
import { glassSkinPaint } from '../logic/glass-skin';

const BURST_TRANSITION: Transition = {
  duration: 0.46,
  delay: 0.52,
  ease: 'easeOut',
  times: [0, 0.3, 1],
};

interface GlassDropSprayDropProps {
  drop: GlassSprayDrop;
  origin: number;
}

export const GlassDropSprayDrop: FC<GlassDropSprayDropProps> = ({ drop, origin }) => {
  const style: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: drop.size,
    height: drop.size,
    marginLeft: -drop.size / 2,
    marginTop: -drop.size / 2,
  };
  const initial = { x: 0, y: origin, scale: 0, opacity: 0 };
  const animate = { x: drop.x, y: drop.y, scale: [0.2, 1, 0.3], opacity: [0, 1, 0] };

  return (
    <motion.div style={style} initial={initial} animate={animate} transition={BURST_TRANSITION}>
      <Box sx={[{ position: 'absolute', inset: 0 }, glassSkinPaint]} />
    </motion.div>
  );
};
