import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { clubHeroIntro } from '@/features/club/hero-content';

export const ClubHeroIntro: FC = () => (
  <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 'sm', fontWeight: 500 }}>
    {clubHeroIntro}
  </Typography>
);
