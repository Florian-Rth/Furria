import { kkTokens } from '@furria/ui';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ClubHero } from './ClubHero/ClubHero';

export const ClubPage: FC = () => (
  <Stack component="main" sx={{ flex: 1 }}>
    <Container maxWidth="xl" sx={{ px: kkTokens.layout.gutterX, py: kkTokens.layout.gutterY }}>
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
    </Container>
  </Stack>
);
