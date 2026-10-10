import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkNewsProofCutNoteProps {
  label: string;
}

export const KkNewsProofCutNote: FC<KkNewsProofCutNoteProps> = ({ label }) => (
  <Typography
    variant="overline"
    data-kk-news-proof-cut-note
    sx={{
      lineHeight: 1.4,
      px: 0.75,
      color: 'primary.main',
      border: '1.5px dashed',
      borderColor: 'primary.main',
      borderRadius: 0.5,
    }}
  >
    {label}
  </Typography>
);
