import { kkTokens } from '@furria/ui';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ChronikTimeline } from './ChronikTimeline/ChronikTimeline';
import { ClubHero } from './ClubHero/ClubHero';
import { ClubStory } from './ClubStory/ClubStory';
import { GruppenGrid } from './GruppenGrid/GruppenGrid';
import { NarrenrufBand } from './NarrenrufBand/NarrenrufBand';
import { PeopleWall } from './PeopleWall/PeopleWall';
import { RecruitBand } from './RecruitBand/RecruitBand';
import { SeasonArc } from './SeasonArc/SeasonArc';

export const ClubPage: FC = () => (
  <Stack component="main" sx={{ flex: 1 }}>
    <Container maxWidth="xl" sx={{ px: kkTokens.layout.gutterX, py: kkTokens.layout.gutterY }}>
      <Stack sx={{ gap: { xs: 8, md: 12 } }}>
        <ClubHero>
          <ClubHero.TextColumn>
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
    <NarrenrufBand />
    <Container maxWidth="xl" sx={{ px: kkTokens.layout.gutterX, py: kkTokens.layout.gutterY }}>
      <Stack sx={{ gap: { xs: 8, md: 12 } }}>
        <ChronikTimeline />
        <SeasonArc />
        <GruppenGrid />
        <PeopleWall />
      </Stack>
    </Container>
    <RecruitBand />
  </Stack>
);
