import { KkPanelSection, KkReservedSlot } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';

const EVENTS_TITLE = 'Noch nicht da';
const EVENTS_DESCRIPTION =
  'Training, Proben und Auftritte der Gruppe an einem Ort. Kommt in einer späteren Phase.';
const EVENTS_BADGE = 'bald';

export const HubEventsSlot: FC = () => (
  <KkPanelSection title={GROUP_SECTION_TITLES.events}>
    <KkReservedSlot
      icon="calendar"
      title={EVENTS_TITLE}
      description={EVENTS_DESCRIPTION}
      badge={EVENTS_BADGE}
    />
  </KkPanelSection>
);
