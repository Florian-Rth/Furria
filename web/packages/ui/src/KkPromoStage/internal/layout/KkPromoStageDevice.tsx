import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { usePromoScene } from '../logic/promo-scene-context';
import { PROMO_FLIGHT } from '../promo-motion';

const PERSPECTIVE = 1800;
const LEAN = -0.25;
const SWAY_SECONDS = 6.5;
const SWAY_DEGREES = 2.4;
const FLOAT = 7;

export type KkPromoDeviceEntry = 'right' | 'bottom' | 'left' | 'top';

const ENTRY_OFFSET: Record<KkPromoDeviceEntry, { x: number; y: number; spin: number }> = {
  right: { x: 520, y: 80, spin: 14 },
  bottom: { x: 60, y: 620, spin: -8 },
  left: { x: -620, y: 60, spin: -12 },
  top: { x: 40, y: -640, spin: 9 },
};

interface KkPromoStageDeviceProps extends PropsWithChildren {
  centerX: number;
  centerY: number;
  tilt: number;
  turn?: number;
  depth?: number;
  entry?: KkPromoDeviceEntry;
  delay?: number;
}

export const KkPromoStageDevice: FC<KkPromoStageDeviceProps> = ({
  centerX,
  centerY,
  tilt,
  turn = 0,
  depth = 1,
  entry = 'right',
  delay = 0.2,
  children,
}) => {
  const { live } = usePromoScene();
  const offset = ENTRY_OFFSET[entry];
  const away = { x: offset.x, y: offset.y, rotate: offset.spin, rotateY: turn - 38 };
  const home = { x: 0, y: 0, rotate: 0, rotateY: turn };
  const flight = { ...PROMO_FLIGHT, delay: live ? delay : 0 };
  const sway = {
    rotateY: [0, SWAY_DEGREES, -SWAY_DEGREES * 0.6, 0],
    y: [0, -FLOAT, FLOAT * 0.5, 0],
  };
  const swayTiming = {
    duration: SWAY_SECONDS,
    repeat: Number.POSITIVE_INFINITY,
    ease: 'easeInOut' as const,
  };

  return (
    <Box
      data-kk-promo-device
      sx={{
        position: 'absolute',
        left: centerX,
        top: centerY,
        zIndex: depth,
        transform: 'translate(-50%, -50%)',
        perspective: `${PERSPECTIVE}px`,
      }}
    >
      <Box
        component={motion.div}
        initial={away}
        animate={live ? home : away}
        transition={flight}
        sx={{ transformStyle: 'preserve-3d' }}
      >
        <Box
          component={motion.div}
          animate={sway}
          transition={swayTiming}
          sx={{ transformStyle: 'preserve-3d' }}
        >
          <Box sx={{ transform: `rotateX(${turn * LEAN}deg) rotate(${tilt}deg)` }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
};
