import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkLaneTrackEmptyProps {
  text: string;
}

export const KkLaneTrackEmpty: FC<KkLaneTrackEmptyProps> = ({ text }) => (
  <Typography
    variant="caption"
    sx={{
      position: 'sticky',
      left: 'calc(var(--kk-lane-head) + 0.75rem)',
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
