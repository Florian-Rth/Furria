import { KkConfettiScatter } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { HeroLayout } from './Hero/HeroLayout';
import { HeroPhoto } from './Hero/HeroPhoto';
import { HeroTextColumn } from './Hero/HeroTextColumn';
import { LandingTicker } from './LandingTicker';

export const LandingPage: FC = () => (
  <Stack component="main" sx={{ flex: 1 }}>
    <Stack sx={{ flex: 1, justifyContent: 'center', px: { xs: 3, md: 7 }, py: 8 }}>
      <HeroLayout>
        <HeroLayout.TextColumn>
          <HeroTextColumn />
        </HeroLayout.TextColumn>
        <HeroLayout.PhotoColumn>
          <KkConfettiScatter count={7} seed={5} />
          <HeroPhoto />
        </HeroLayout.PhotoColumn>
      </HeroLayout>
    </Stack>
    <LandingTicker />
  </Stack>
);
