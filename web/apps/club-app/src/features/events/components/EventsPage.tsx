import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, EVENTS_TITLE, MORE_SECTION } from '@/features/session';
import { EVENTS_LEAD } from '../events-labels';
import { EventsBody } from './EventsBody';

export const EventsPage: FC = () => (
  <KkScreen
    kind="overview"
    section={MORE_SECTION}
    title={EVENTS_TITLE}
    header={<KkTitleHeader title={EVENTS_TITLE} lead={EVENTS_LEAD} />}
    handover={AREA_HANDOVERS.events}
    headerKind="title"
  >
    <EventsBody />
  </KkScreen>
);
