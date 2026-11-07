import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkVideoNoteProps {
  text: string;
}

export const KkVideoNote: FC<KkVideoNoteProps> = ({ text }) => (
  <Typography
    component="p"
    variant="caption"
    sx={{
      position: 'absolute',
      inset: 0,
      m: 0,
      display: 'grid',
      placeItems: 'center',
      textAlign: 'center',
      px: 2,
      opacity: 0.72,
    }}
  >
    {text}
  </Typography>
);
