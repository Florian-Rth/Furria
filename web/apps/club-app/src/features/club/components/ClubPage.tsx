import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, CLUB_SECTION } from '@/features/session';
import { ClubBody } from './ClubBody';
import { ClubStage } from './ClubStage';

const CLUB_TITLE = 'Verein';

export const ClubPage: FC = () => (
  <KkScreen
    kind="overview"
    section={CLUB_SECTION}
    title={CLUB_TITLE}
    header={<ClubStage />}
    handover={AREA_HANDOVERS.club}
    headerKind="banner"
  >
    <ClubBody />
  </KkScreen>
);
