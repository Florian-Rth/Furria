import { KkPanelSection, KkReservedSlot } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { EVENTS_SLOT_DESCRIPTION, EVENTS_SLOT_TITLE, RESERVED_BADGE } from '../group-hub-labels';

export const HubEventsSlot: FC = () => (
  <KkPanelSection title={GROUP_SECTION_TITLES.events}>
    <KkReservedSlot
      icon="calendar"
      title={EVENTS_SLOT_TITLE}
      description={EVENTS_SLOT_DESCRIPTION}
      badge={RESERVED_BADGE}
    />
  </KkPanelSection>
);
