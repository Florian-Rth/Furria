import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkNewsProofChangedMarkProps {
  label: string;
}

export const KkNewsProofChangedMark: FC<KkNewsProofChangedMarkProps> = ({ label }) => (
  <Typography
    variant="overline"
    data-kk-news-proof-changed
    sx={{
      lineHeight: 1.4,
      px: 0.75,
      color: 'primary.main',
      borderLeft: 3,
      borderColor: 'primary.main',
    }}
  >
    {label}
  </Typography>
);
