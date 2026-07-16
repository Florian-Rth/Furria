import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface TwoToneHeadlineProps {
  line1: string;
  line2: string;
}

// Signature two-tone headline pattern: line 1 ink, line 2 red.
export const TwoToneHeadline: FC<TwoToneHeadlineProps> = ({ line1, line2 }) => (
  <Typography variant="h1" component="h1">
    <Box component="span" sx={{ display: 'block', color: 'text.primary' }}>
      {line1}
    </Box>
    <Box component="span" sx={{ display: 'block', color: 'primary.main' }}>
      {line2}
    </Box>
  </Typography>
);
