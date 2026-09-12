import { KkPanelSection, KkReservedSlot } from '@furria/ui';
import type { FC } from 'react';
import { EVENTS_RESERVED, GROUP_SECTION_TITLES, RESERVED_BADGE } from '../groups-labels';

export const GroupEventsSlot: FC = () => (
  <KkPanelSection title={GROUP_SECTION_TITLES.events}>
    <KkReservedSlot
      icon="calendar"
      title={EVENTS_RESERVED.title}
      description={EVENTS_RESERVED.description}
      badge={RESERVED_BADGE}
    />
  </KkPanelSection>
);
