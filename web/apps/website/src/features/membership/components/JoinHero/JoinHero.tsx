import { KkHeroSection } from '@furria/ui';
import Button from '@mui/material/Button';
import type { FC } from 'react';
import {
  joinApplyHref,
  joinDescription,
  joinEyebrow,
  joinPageTitle,
  joinPrimaryCtaLabel,
  joinSecondaryCtaLabel,
  kompassSectionHref,
} from '@/features/membership/join-content';
import { JoinHeroPhoto } from './internal/ui/JoinHeroPhoto';
import { JoinHeroStats } from './internal/ui/JoinHeroStats';

export const JoinHero: FC = () => (
  <KkHeroSection>
    <KkHeroSection.Main>
      <KkHeroSection.Eyebrow>{joinEyebrow}</KkHeroSection.Eyebrow>
      <KkHeroSection.Title>{joinPageTitle}</KkHeroSection.Title>
      <KkHeroSection.Description>{joinDescription}</KkHeroSection.Description>
      <KkHeroSection.Actions>
        <Button href={joinApplyHref} variant="contained" color="primary" size="large">
          {joinPrimaryCtaLabel}
        </Button>
        <Button href={kompassSectionHref} variant="outlined" size="large">
          {joinSecondaryCtaLabel}
        </Button>
      </KkHeroSection.Actions>
      <JoinHeroStats />
    </KkHeroSection.Main>
    <KkHeroSection.Aside>
      <JoinHeroPhoto />
    </KkHeroSection.Aside>
  </KkHeroSection>
);
