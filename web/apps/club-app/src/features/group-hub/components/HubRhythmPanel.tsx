import { KkLead, KkPanel, KkPanelSection, KkReservedSlot } from '@furria/ui';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups';
import { toRhythmSentence } from '@/features/groups';
import { GROUP_SECTION_TITLES, RESERVED_BADGE, RHYTHM_RESERVED } from '@/lib/group-sections';
import type { TrainingSlot } from '../schemas';

interface HubRhythmPanelProps {
  tone: GroupTone;
  slots: readonly TrainingSlot[];
}

export const HubRhythmPanel: FC<HubRhythmPanelProps> = ({ tone, slots }) => {
  const sentence = toRhythmSentence(slots);

  const body =
    sentence === null ? (
      <KkReservedSlot
        icon="events"
        title={RHYTHM_RESERVED.title}
        description={RHYTHM_RESERVED.description}
        badge={RESERVED_BADGE}
      />
    ) : (
      <KkPanel variant="block">
        <KkLead>{sentence}</KkLead>
      </KkPanel>
    );

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.rhythm} groupTone={tone}>
      {body}
    </KkPanelSection>
  );
};
