import { KkHeroSection, KkRule, PageLayout } from '@furria/ui';
import Button from '@mui/material/Button';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';

interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
}

export const PlaceholderPage: FC<PlaceholderPageProps> = ({ eyebrow, title }) => (
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
            <Button component={RouterLink} to="/news" variant="contained" size="large">
              Zu den Meldungen →
            </Button>
          </KkHeroSection.Actions>
        </KkHeroSection.Main>
      </KkHeroSection>
      <KkRule />
    </PageLayout.Body>
  </PageLayout>
);
