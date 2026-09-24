import { PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { CarnivalCallBand } from './CarnivalCallBand/CarnivalCallBand';
import { ChronicleTimeline } from './ChronicleTimeline/ChronicleTimeline';
import { ClubHeader } from './ClubHeader/ClubHeader';
import { ClubStory } from './ClubStory/ClubStory';
import { GroupsGrid } from './GroupsGrid/GroupsGrid';
import { PeopleWall } from './PeopleWall/PeopleWall';
import { RecruitBand } from './RecruitBand/RecruitBand';
import { SeasonArc } from './SeasonArc/SeasonArc';

export const ClubPage: FC = () => (
  <PageLayout>
    <PageLayout.Body>
      <ClubHeader />
      <ClubStory />
    </PageLayout.Body>
    <CarnivalCallBand />
    <PageLayout.Body>
      <ChronicleTimeline />
      <SeasonArc />
      <GroupsGrid />
      <PeopleWall />
    </PageLayout.Body>
    <RecruitBand />
  </PageLayout>
);
