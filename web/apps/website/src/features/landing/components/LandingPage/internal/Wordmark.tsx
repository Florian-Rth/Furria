import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface WordmarkProps {
  text: string;
}

export const Wordmark: FC<WordmarkProps> = ({ text }) => (
  <Typography variant="h4" component="span" sx={{ color: 'text.primary', letterSpacing: '0.04em' }}>
    {text}
  </Typography>
);
