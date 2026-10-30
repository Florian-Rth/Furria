import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkEightsFrameHeadingProps {
  text: string;
}

export const KkEightsFrameHeading: FC<KkEightsFrameHeadingProps> = ({ text }) => (
  <Typography
    component="h1"
    sx={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      p: 0,
      m: '-1px',
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)',
      whiteSpace: 'nowrap',
      border: 0,
    }}
  >
    {text}
  </Typography>
);
