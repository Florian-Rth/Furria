import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { clubHeroPrimaryCtaLabel, clubHeroSecondaryCtaLabel } from '@/features/club/hero-content';

export const ClubHeroActions: FC = () => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
    <Button component={RouterLink} to="/join" variant="contained" color="primary" size="large">
      {clubHeroPrimaryCtaLabel}
    </Button>
    <Button component={RouterLink} to="/program" variant="outlined" size="large">
      {clubHeroSecondaryCtaLabel}
    </Button>
  </Stack>
);
