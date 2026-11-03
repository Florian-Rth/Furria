import Box from '@mui/material/Box';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { SCORE_FIGURES } from '../../../internal/score-paint';

interface KkScoreTransportClockProps {
  position: string | MotionValue<string>;
  length: string;
}

export const KkScoreTransportClock: FC<KkScoreTransportClockProps> = ({ position, length }) => (
  <Box
    component="span"
    data-kk-score-clock
    sx={{ typography: 'body2', fontWeight: 800, whiteSpace: 'nowrap', ...SCORE_FIGURES }}
  >
    <motion.span>{position}</motion.span>
    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>
      {` / ${length}`}
    </Box>
  </Box>
);
