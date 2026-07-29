import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KompassPromptProps {
  prompt: string;
}

export const KompassPrompt: FC<KompassPromptProps> = ({ prompt }) => (
  <Typography
    component="p"
    sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 700, lineHeight: 1.3 }}
  >
    {prompt}
  </Typography>
);
