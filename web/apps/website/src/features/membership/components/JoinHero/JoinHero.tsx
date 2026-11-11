import { KkHeroSection } from '@furria/ui/KkHeroSection';
import Button from '@mui/material/Button';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { useHasGroupMatcher } from '@/features/group-matcher/hooks/use-has-group-matcher';
import {
  joinDescription,
  joinEyebrow,
  joinPageTitle,
  joinPrimaryCtaLabel,
  joinSecondaryCtaLabel,
  matcherSectionHref,
} from '@/features/membership/join-content';
import { JoinHeroPhoto } from './internal/ui/JoinHeroPhoto';
import { JoinHeroStats } from './internal/ui/JoinHeroStats';

export const JoinHero: FC = () => {
  const hasGroupMatcher = useHasGroupMatcher();
  const matcherAction = hasGroupMatcher ? (
    <Button href={matcherSectionHref} variant="outlined" size="large">
      {joinSecondaryCtaLabel}
    </Button>
  ) : null;

  return (
    <KkHeroSection>
      <KkHeroSection.Main>
        <KkHeroSection.Eyebrow>{joinEyebrow}</KkHeroSection.Eyebrow>
        <KkHeroSection.Title>{joinPageTitle}</KkHeroSection.Title>
        <KkHeroSection.Description>{joinDescription}</KkHeroSection.Description>
        <KkHeroSection.Actions>
          <Button
            component={RouterLink}
            to="/join/apply"
            variant="contained"
            color="primary"
            size="large"
          >
            {joinPrimaryCtaLabel}
          </Button>
          {matcherAction}
        </KkHeroSection.Actions>
        <JoinHeroStats />
      </KkHeroSection.Main>
      <KkHeroSection.Aside>
        <JoinHeroPhoto />
      </KkHeroSection.Aside>
    </KkHeroSection>
  );
};
