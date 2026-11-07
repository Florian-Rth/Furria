import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkEjPanelNoteProps {
  text: string;
}

export const KkEjPanelNote: FC<KkEjPanelNoteProps> = ({ text }) => (
  <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
    {text}
  </Typography>
);
