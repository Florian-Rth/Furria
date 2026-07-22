import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface TeaserWordmarkProps {
  text: string;
}

export const TeaserWordmark: FC<TeaserWordmarkProps> = ({ text }) => (
  <Typography variant="h4" component="span" sx={{ color: 'text.primary', letterSpacing: '0.04em' }}>
    {text}
  </Typography>
);
