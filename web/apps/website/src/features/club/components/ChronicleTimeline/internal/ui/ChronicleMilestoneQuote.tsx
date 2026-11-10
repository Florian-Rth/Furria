import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface ChronicleMilestoneQuoteProps {
  text: string;
}

export const ChronicleMilestoneQuote: FC<ChronicleMilestoneQuoteProps> = ({ text }) => (
  <Typography
    variant="inherit"
    component="q"
    data-kk-chronicle-quote
    sx={{
      fontWeight: 800,
      fontStyle: 'italic',
      color: 'primary.main',
      quotes: 'none',
    }}
  >
    {text}
  </Typography>
);
