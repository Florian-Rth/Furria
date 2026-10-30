import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkFocusPopNoteProps {
  text: string;
}

export const KkFocusPopNote: FC<KkFocusPopNoteProps> = ({ text }) => (
  <Typography variant="body2" sx={{ px: 1, py: 1, color: 'text.secondary' }}>
    {text}
  </Typography>
);
