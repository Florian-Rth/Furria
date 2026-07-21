import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { Hero } from './Hero/Hero';
import { LandingTicker } from './LandingTicker';

export const LandingPage: FC = () => (
  <Stack component="main" sx={{ flex: 1 }}>
    <Container
      maxWidth="xl"
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: { xs: 3, md: 7 },
        py: 8,
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
    <LandingTicker />
  </Stack>
);
