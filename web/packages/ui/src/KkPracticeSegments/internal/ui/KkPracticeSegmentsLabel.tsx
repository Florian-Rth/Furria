import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkPracticeSegmentsLabelProps {
  text: string;
  current: boolean;
}

export const KkPracticeSegmentsLabel: FC<KkPracticeSegmentsLabelProps> = ({ text, current }) => (
  <Typography
    variant="caption"
    sx={{
      display: 'block',
      minWidth: 0,
      fontWeight: 800,
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: current ? 'text.primary' : 'text.secondary',
      transition: 'color 200ms ease-out',
    }}
  >
    {text}
  </Typography>
);
