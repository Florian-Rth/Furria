import { kkTokens } from '@furria/ui';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { EventsTeaser } from './EventsTeaser/EventsTeaser';
import { Hero } from './Hero/Hero';
import { HeroFollow } from './HeroFollow';
import { JoinInBand } from './JoinInBand/JoinInBand';
import { LandingHeroBackdrop } from './LandingHeroBackdrop';
import { LandingTicker } from './LandingTicker';
import { MobileHero } from './MobileHero/MobileHero';

interface LandingPageProps {
  newsTeaser?: ReactNode;
}

export const LandingPage: FC<LandingPageProps> = ({ newsTeaser }) => (
  <Stack component="main" sx={{ flex: 1 }}>
    <Stack
      sx={{
        position: 'relative',
        isolation: 'isolate',
        flex: 1,
      }}
    >
      <LandingHeroBackdrop />
      <Container
        data-kk-landing-desktop-hero
        maxWidth="xl"
        sx={{
          display: { xs: 'none', desktop: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          px: kkTokens.layout.gutterX,
          py: kkTokens.layout.gutterY,
        }}
      >
        <Hero>
          <Hero.TextColumn>
            <Hero.Eyebrow />
            <Hero.Headline />
            <Hero.Intro />
            <Hero.Actions />
            <Hero.StatRow />
          </Hero.TextColumn>
          <Hero.PhotoColumn>
            <Hero.Photo />
          </Hero.PhotoColumn>
        </Hero>
      </Container>
      <Stack data-kk-landing-mobile-hero sx={{ display: { xs: 'flex', desktop: 'none' } }}>
        <MobileHero>
          <MobileHero.Photo />
          <MobileHero.Content>
            <MobileHero.Eyebrow />
            <MobileHero.Headline />
          </MobileHero.Content>
        </MobileHero>
        <HeroFollow>
          <Hero.Intro />
          <Hero.Actions />
          <Hero.StatRow />
        </HeroFollow>
      </Stack>
    </Stack>
    <LandingTicker />
    <Container maxWidth="xl" sx={{ px: kkTokens.layout.gutterX, py: kkTokens.layout.gutterY }}>
      <Stack sx={{ gap: kkTokens.layout.sectionGap }}>
        <EventsTeaser />
        {newsTeaser}
        <JoinInBand />
      </Stack>
    </Container>
  </Stack>
);
