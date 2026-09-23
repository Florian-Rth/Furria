import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import type { GlassBeadRole } from '../logic/glass-drop-paths';
import { skinPathOf } from '../logic/glass-drop-paths';
import { glassSkinPaint } from '../logic/glass-skin';

const SKIN_STYLE = { position: 'absolute', inset: 0 } as const;

interface GlassDropSkinProps {
  part: GlassBeadRole;
}

export const GlassDropSkin: FC<GlassDropSkinProps> = ({ part }) => {
  const skin = skinPathOf(part);
  const transition = { duration: skin.duration, delay: skin.delay, times: skin.times };
  const initial = { opacity: skin.opacity[0] };
  const animate = { opacity: skin.opacity };

  return (
    <motion.div style={SKIN_STYLE} initial={initial} animate={animate} transition={transition}>
      <Box sx={[{ position: 'absolute', inset: 0 }, glassSkinPaint]} />
    </motion.div>
  );
};
