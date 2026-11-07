import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

export const HeroIntro: FC = () => (
  <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 'sm', fontWeight: 500 }}>
    Der Furrsche Carnevals Club lädt ganz{' '}
    <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
      Großfurra
    </Box>{' '}
    zur fünften Jahreszeit ein — mit Herz, seit Generationen.
  </Typography>
);
