import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioIDetailLineProps {
  text: string;
}

export const KkStudioIDetailLine: FC<KkStudioIDetailLineProps> = ({ text }) => (
  <Typography
    variant="caption"
    data-kk-studio-i-detail-line
    sx={{
      fontWeight: 700,
      color: 'text.secondary',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }}
  >
    {text}
  </Typography>
);
