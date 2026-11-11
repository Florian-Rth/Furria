import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { KkBroomMark } from '../../../KkBroomMark';
import {
  PROMO_GRAIN,
  PROMO_GRAIN_OPACITY,
  PROMO_WATERMARK_OPACITY,
  PROMO_WATERMARK_SIZE,
} from '../promo-paint';
import { PromoGlow } from './PromoGlow';

const WATERMARK_DRIFT = {
  rotate: [-9, -5, -11, -9],
  x: [0, -26, 14, 0],
  y: [0, 18, -10, 0],
};
const WATERMARK_TIMING = {
  duration: 38,
  repeat: Number.POSITIVE_INFINITY,
  ease: 'easeInOut' as const,
};

export const PromoPaper: FC = () => (
  <>
    <PromoGlow />
    <Box
      component={motion.div}
      aria-hidden
      data-kk-promo-watermark
      animate={WATERMARK_DRIFT}
      transition={WATERMARK_TIMING}
      sx={{
        position: 'absolute',
        right: -PROMO_WATERMARK_SIZE * 0.22,
        top: -PROMO_WATERMARK_SIZE * 0.12,
        color: 'text.primary',
        opacity: PROMO_WATERMARK_OPACITY,
      }}
    >
      <KkBroomMark size={PROMO_WATERMARK_SIZE} />
    </Box>
    <Box
      aria-hidden
      data-kk-promo-grain
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: PROMO_GRAIN,
        opacity: PROMO_GRAIN_OPACITY,
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  </>
);
