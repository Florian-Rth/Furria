import { KkHeroSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { exchangeHeroContent } from '@/features/events/exchange-content';
import { PlanningMarker } from './PlanningMarker';

export const ExchangeHero: FC = () => (
  <KkHeroSection>
    <KkHeroSection.Main>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <KkHeroSection.Eyebrow>{exchangeHeroContent.eyebrow}</KkHeroSection.Eyebrow>
        <PlanningMarker />
      </Stack>
      <KkHeroSection.Title>{exchangeHeroContent.title}</KkHeroSection.Title>
      <KkHeroSection.Description>{exchangeHeroContent.description}</KkHeroSection.Description>
    </KkHeroSection.Main>
  </KkHeroSection>
);
