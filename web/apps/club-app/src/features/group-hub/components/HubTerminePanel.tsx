import { KkPanelSection, KkReservedSlot } from '@furria/ui';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups';
import { EVENTS_RESERVED, GROUP_SECTION_TITLES, RESERVED_BADGE } from '@/lib/group-sections';

interface HubTerminePanelProps {
  tone: GroupTone;
}

export const HubTerminePanel: FC<HubTerminePanelProps> = ({ tone }) => (
  <KkPanelSection title={GROUP_SECTION_TITLES.events} groupTone={tone}>
    <KkReservedSlot
      icon="calendar"
      title={EVENTS_RESERVED.title}
      description={EVENTS_RESERVED.description}
      badge={RESERVED_BADGE}
    />
  </KkPanelSection>
);
