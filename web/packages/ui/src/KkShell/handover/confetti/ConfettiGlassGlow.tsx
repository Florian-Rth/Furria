import Box from '@mui/material/Box';
import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import type { DockGeometry } from './dock-flight';

const GLOW_REACH = 16;
const GLOW_HEIGHT_SHARE = 0.9;
const GLOW_SECONDS = 0.6;
const GLOW_BLOOM = {
  opacity: [0, 0.55, 0],
  scaleX: [0.4, 1, 1.15],
  scaleY: [0.6, 1, 0.8],
};
const GLOW_TIMING: Transition = { duration: GLOW_SECONDS, times: [0, 0.25, 1], ease: 'easeOut' };

interface ConfettiGlassGlowProps {
  geometry: DockGeometry | null;
  landingKey: number;
}

export const ConfettiGlassGlow: FC<ConfettiGlassGlowProps> = ({ geometry, landingKey }) => {
  if (geometry === null || landingKey === 0) {
    return null;
  }

  const { slot, titleWidth } = geometry;
  const height = slot.height * GLOW_HEIGHT_SHARE;
  const glowStyle = {
    position: 'fixed' as const,
    left: slot.left - GLOW_REACH,
    top: slot.top + (slot.height - height) / 2,
    width: titleWidth + GLOW_REACH * 2,
    height,
    opacity: 0,
  };

  return (
    <Box
      aria-hidden
      sx={(theme) => ({
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: theme.zIndex.appBar - 1,
        pointerEvents: 'none',
      })}
    >
      <motion.div key={landingKey} style={glowStyle} animate={GLOW_BLOOM} transition={GLOW_TIMING}>
        <Box sx={{ width: 1, height: 1, borderRadius: '50%', bgcolor: 'warning.main' }} />
      </motion.div>
    </Box>
  );
};
