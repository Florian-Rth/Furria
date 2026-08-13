import { KkHeroSection } from '@furria/ui';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  clubDescription,
  clubEyebrow,
  clubPageTitle,
  clubPrimaryCtaLabel,
  clubSecondaryCtaLabel,
} from '@/features/club/header-content';
import { ClubHeroNumeral } from './internal/ui/ClubHeroNumeral';
import { ClubHeroPhoto } from './internal/ui/ClubHeroPhoto';

export const ClubHeader: FC = () => (
  <KkHeroSection>
    <KkHeroSection.Main>
      <KkHeroSection.Eyebrow>{clubEyebrow}</KkHeroSection.Eyebrow>
      <KkHeroSection.Title>{clubPageTitle}</KkHeroSection.Title>
      <KkHeroSection.Description>{clubDescription}</KkHeroSection.Description>
      <KkHeroSection.Actions>
        <Button component={RouterLink} to="/join" variant="contained" color="primary" size="large">
          {clubPrimaryCtaLabel}
        </Button>
        <Button component={RouterLink} to="/events" variant="outlined" size="large">
          {clubSecondaryCtaLabel}
        </Button>
      </KkHeroSection.Actions>
    </KkHeroSection.Main>
    <KkHeroSection.Aside>
      <ClubHeroNumeral />
      <Box sx={{ pt: { md: 9 } }}>
        <ClubHeroPhoto />
      </Box>
    </KkHeroSection.Aside>
  </KkHeroSection>
);
