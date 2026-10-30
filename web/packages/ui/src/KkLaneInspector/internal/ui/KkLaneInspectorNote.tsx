import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkLaneInspectorNoteProps {
  text: string;
}

export const KkLaneInspectorNote: FC<KkLaneInspectorNoteProps> = ({ text }) => (
  <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
    {text}
  </Typography>
);
