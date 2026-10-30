import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioGInspectorNoteProps {
  text: string;
}

export const KkStudioGInspectorNote: FC<KkStudioGInspectorNoteProps> = ({ text }) => (
  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
    {text}
  </Typography>
);
