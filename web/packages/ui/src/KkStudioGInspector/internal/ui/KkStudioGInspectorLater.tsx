import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioGInspectorLaterProps {
  text: string;
}

export const KkStudioGInspectorLater: FC<KkStudioGInspectorLaterProps> = ({ text }) => (
  <Typography
    variant="caption"
    sx={{ alignSelf: 'center', color: 'text.disabled', fontWeight: 600, fontStyle: 'italic' }}
  >
    {text}
  </Typography>
);
