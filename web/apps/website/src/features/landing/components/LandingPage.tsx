import { kkTokens } from '@furria/ui';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { Hero } from './Hero/Hero';
import { HeroFollow } from './HeroFollow';
import { LandingTicker } from './LandingTicker';
import { MobileHero } from './MobileHero/MobileHero';

export const LandingPage: FC = () => (
  <Stack component="main" sx={{ flex: 1 }}>
    <Container
      data-kk-landing-desktop-hero
      maxWidth="xl"
      sx={{
        display: { xs: 'none', md: 'flex' },
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
          <Hero.Confetti />
          <Hero.Photo />
        </Hero.PhotoColumn>
      </Hero>
    </Container>
    <Stack data-kk-landing-mobile-hero sx={{ display: { xs: 'flex', md: 'none' } }}>
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
    <LandingTicker />
  </Stack>
);
