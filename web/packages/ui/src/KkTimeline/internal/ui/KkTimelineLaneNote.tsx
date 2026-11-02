import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { LANE_AHEAD } from '../lane-sizes';

interface KkTimelineLaneNoteProps {
  text: string;
}

export const KkTimelineLaneNote: FC<KkTimelineLaneNoteProps> = ({ text }) => (
  <Typography
    variant="caption"
    sx={{
      position: 'absolute',
      top: '50%',
      left: LANE_AHEAD,
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'text.secondary',
      fontStyle: 'italic',
    }}
  >
    {text}
  </Typography>
);
