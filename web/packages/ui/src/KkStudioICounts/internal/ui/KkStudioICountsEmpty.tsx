import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioICountsEmptyProps {
  text: string;
}

export const KkStudioICountsEmpty: FC<KkStudioICountsEmptyProps> = ({ text }) => (
  <Typography
    component="span"
    variant="caption"
    sx={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: '0.375rem',
      lineHeight: 1,
      textAlign: 'center',
      color: 'text.secondary',
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </Typography>
);
