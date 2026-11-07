import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkJobPanelNoteProps {
  text: string;
}

export const KkJobPanelNote: FC<KkJobPanelNoteProps> = ({ text }) => (
  <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
    {text}
  </Typography>
);
