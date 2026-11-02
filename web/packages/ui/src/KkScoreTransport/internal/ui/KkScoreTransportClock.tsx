import Box from '@mui/material/Box';
import type { FC } from 'react';
import { SCORE_FIGURES } from '../../../internal/score-paint';

interface KkScoreTransportClockProps {
  position: string;
  length: string;
}

export const KkScoreTransportClock: FC<KkScoreTransportClockProps> = ({ position, length }) => (
  <Box
    component="span"
    data-kk-score-clock
    sx={{ typography: 'body2', fontWeight: 800, whiteSpace: 'nowrap', ...SCORE_FIGURES }}
  >
    {position}
    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>
      {` / ${length}`}
    </Box>
  </Box>
);
