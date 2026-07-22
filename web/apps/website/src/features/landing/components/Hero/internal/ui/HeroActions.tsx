import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';

export const HeroActions: FC = () => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
    <Button component={RouterLink} to="/tickets" variant="contained" color="primary" size="large">
      Tickets sichern →
    </Button>
    <Button component={RouterLink} to="/program" variant="outlined" size="large">
      Programm ansehen
    </Button>
  </Stack>
);
