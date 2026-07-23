import { kkTokens } from '@furria/ui';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ClubHero } from './ClubHero/ClubHero';
import { ClubStory } from './ClubStory/ClubStory';

export const ClubPage: FC = () => (
  <Stack component="main" sx={{ flex: 1 }}>
    <Container maxWidth="xl" sx={{ px: kkTokens.layout.gutterX, py: kkTokens.layout.gutterY }}>
      <Stack sx={{ gap: { xs: 8, md: 12 } }}>
        <ClubHero>
          <ClubHero.TextColumn>
            <ClubHero.Eyebrow />
            <ClubHero.Headline />
            <ClubHero.Intro />
            <ClubHero.Actions />
          </ClubHero.TextColumn>
          <ClubHero.PhotoColumn>
            <ClubHero.Photo />
          </ClubHero.PhotoColumn>
        </ClubHero>
        <ClubStory />
      </Stack>
    </Container>
  </Stack>
);
