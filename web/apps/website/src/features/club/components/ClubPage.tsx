import { PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { ChronikTimeline } from './ChronikTimeline/ChronikTimeline';
import { ClubHeader } from './ClubHeader/ClubHeader';
import { ClubStory } from './ClubStory/ClubStory';
import { GruppenGrid } from './GruppenGrid/GruppenGrid';
import { NarrenrufBand } from './NarrenrufBand/NarrenrufBand';
import { PeopleWall } from './PeopleWall/PeopleWall';
import { RecruitBand } from './RecruitBand/RecruitBand';
import { SeasonArc } from './SeasonArc/SeasonArc';

export const ClubPage: FC = () => (
  <PageLayout>
    <PageLayout.Body>
      <ClubHeader />
      <ClubStory />
    </PageLayout.Body>
    <NarrenrufBand />
    <PageLayout.Body>
      <ChronikTimeline />
      <SeasonArc />
      <GruppenGrid />
      <PeopleWall />
    </PageLayout.Body>
    <RecruitBand />
  </PageLayout>
);
