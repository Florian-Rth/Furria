import { KkHeroSection, KkRule, PageLayout } from '@furria/ui';
import Button from '@mui/material/Button';
import type { LinkProps } from '@tanstack/react-router';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';

interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  ctaLabel?: string;
  ctaTo?: LinkProps['to'];
}

export const PlaceholderPage: FC<PlaceholderPageProps> = ({
  eyebrow,
  title,
  ctaLabel = 'Zu den Meldungen →',
  ctaTo = '/news',
}) => (
  <PageLayout>
    <PageLayout.Body>
      <KkHeroSection>
        <KkHeroSection.Main>
          <KkHeroSection.Eyebrow>{eyebrow}</KkHeroSection.Eyebrow>
          <KkHeroSection.Title>{title}</KkHeroSection.Title>
          <KkHeroSection.Description>
            Diese Seite entsteht gerade. Wir arbeiten hinter den Kulissen daran — schau bald wieder
            vorbei, Gross - Furria!
          </KkHeroSection.Description>
          <KkHeroSection.Actions>
            <Button component={RouterLink} to={ctaTo} variant="contained" size="large">
              {ctaLabel}
            </Button>
          </KkHeroSection.Actions>
        </KkHeroSection.Main>
      </KkHeroSection>
      <KkRule />
    </PageLayout.Body>
  </PageLayout>
);
