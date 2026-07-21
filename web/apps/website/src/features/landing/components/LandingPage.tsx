import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { HeroTextColumn } from './Hero/HeroTextColumn';

export const LandingPage: FC = () => (
  <Stack component="main" sx={{ flex: 1, justifyContent: 'center', px: { xs: 3, md: 7 }, py: 8 }}>
    <HeroTextColumn />
  </Stack>
);
