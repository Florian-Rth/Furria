import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from './tokens';

interface KkTwoToneHeadlineProps {
  line1: string;
  line2: string;
  posterShadow?: boolean;
}

export const KkTwoToneHeadline: FC<KkTwoToneHeadlineProps> = ({
  line1,
  line2,
  posterShadow = false,
}) => (
  <Typography variant="h1" component="h1">
    <Box component="span" sx={{ display: 'block', color: 'text.primary' }}>
      {line1}
    </Box>
    <Box
      component="span"
      sx={(theme) => ({
        display: 'block',
        color: 'primary.main',
        textShadow: posterShadow
          ? `${kkTokens.shadow.posterOffset} ${theme.palette.text.primary}`
          : 'none',
      })}
    >
      {line2}
    </Box>
  </Typography>
);
