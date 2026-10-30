import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkFocusBarNoteProps {
  text: string;
}

export const KkFocusBarNote: FC<KkFocusBarNoteProps> = ({ text }) => (
  <Typography
    component="span"
    role="status"
    variant="caption"
    sx={{
      flex: 'none',
      px: 1,
      fontWeight: 800,
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums',
      color: 'text.secondary',
    }}
  >
    {text}
  </Typography>
);
