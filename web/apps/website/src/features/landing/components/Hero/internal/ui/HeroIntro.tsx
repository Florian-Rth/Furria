import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

export const HeroIntro: FC = () => (
  <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 'sm', fontWeight: 500 }}>
    Der Furrsche Carnevals Club lädt euch zur fünften Jahreszeit nach{' '}
    <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
      Großfurra
    </Box>{' '}
    ein — seit Generationen.
  </Typography>
);
