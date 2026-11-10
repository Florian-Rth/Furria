import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { PROMO_CANVAS } from '../promo-paint';

const BAND_WIDTH = 150;
const SHARP = [0.83, 0, 0.17, 1] as const;

interface PromoWipeBandProps {
  seconds: number;
}

export const PromoWipeBand: FC<PromoWipeBandProps> = ({ seconds }) => (
  <Box
    component={motion.div}
    aria-hidden
    initial={{ x: 0 }}
    animate={{ x: PROMO_CANVAS.width + BAND_WIDTH }}
    transition={{ duration: seconds, ease: SHARP }}
    sx={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: -BAND_WIDTH / 2,
      width: BAND_WIDTH,
      zIndex: 3,
      pointerEvents: 'none',
    }}
  >
    <Box
      sx={{ width: '100%', height: '100%', bgcolor: 'primary.main', transform: 'skewX(-8deg)' }}
    />
  </Box>
);
