import Box from '@mui/material/Box';
import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { GlassDropDirection } from '../logic/glass-drop-plan';
import { glassSkinPaint } from '../logic/glass-skin';

const NECK_WIDTH = 18;
const NECK_LENGTH = 60;
const NECK_ANIMATE = { scaleY: [0, 1, 0.85, 0], scaleX: [1, 0.62, 0.3, 0] };
const NECK_TRANSITION: Transition = {
  duration: 0.6,
  times: [0, 0.36, 0.66, 0.78],
  ease: 'easeOut',
};

interface GlassDropNeckProps {
  direction: GlassDropDirection;
}

export const GlassDropNeck: FC<GlassDropNeckProps> = ({ direction }) => {
  const down = direction === 1;
  const style: CSSProperties = {
    position: 'absolute',
    left: '50%',
    marginLeft: -NECK_WIDTH / 2,
    width: NECK_WIDTH,
    height: NECK_LENGTH,
    top: down ? '50%' : undefined,
    bottom: down ? undefined : '50%',
    transformOrigin: down ? '50% 0%' : '50% 100%',
  };

  return (
    <motion.div
      style={style}
      initial={{ scaleY: 0 }}
      animate={NECK_ANIMATE}
      transition={NECK_TRANSITION}
    >
      <Box
        sx={[{ position: 'absolute', inset: 0 }, glassSkinPaint, { borderRadius: NECK_WIDTH / 2 }]}
      />
    </motion.div>
  );
};
