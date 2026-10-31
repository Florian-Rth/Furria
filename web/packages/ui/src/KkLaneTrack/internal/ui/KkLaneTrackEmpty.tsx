import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { LANE_STICKY_LEFT } from '../lane-geometry';

interface KkLaneTrackEmptyProps {
  text: string;
}

export const KkLaneTrackEmpty: FC<KkLaneTrackEmptyProps> = ({ text }) => (
  <Typography
    variant="caption"
    sx={{
      position: 'sticky',
      left: LANE_STICKY_LEFT,
      display: 'inline-block',
      pl: 1,
      lineHeight: 2.75,
      color: 'text.secondary',
      fontStyle: 'italic',
    }}
  >
    {text}
  </Typography>
);
