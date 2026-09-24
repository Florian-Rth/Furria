import type { KkPanelAction } from '@furria/ui';
import {
  KkButton,
  KkEmptyState,
  KkIcon,
  KkLead,
  KkMeta,
  KkNote,
  KkPanel,
  KkPanelSection,
} from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups';
import { toRhythmSentence } from '@/features/groups';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { useRhythmSlotsInfo } from '../hooks/use-rhythm-slots-info';
import {
  RHYTHM_ADD_ACTION_LABEL,
  RHYTHM_ADD_LABEL,
  RHYTHM_ADMIN_NOTE,
  RHYTHM_ARCHIVED_VENUE_NOTE,
  RHYTHM_EMPTY_LINE,
  RHYTHM_EMPTY_TITLE,
  RHYTHM_FULL_NOTE,
  RHYTHM_GENERATE_HINT,
  RHYTHM_GENERATE_LABEL,
  toRhythmMeta,
} from '../rhythm-labels';
import type { TrainingSlot } from '../schemas';
import { HubRhythmRow } from './HubRhythmRow';

const NEW_SLOT_ROUTE = '/groups/$groupId/slots/new';
const TRAININGS_ROUTE = '/groups/$groupId/trainings';

interface HubRhythmPanelProps {
  groupId: number;
  tone: GroupTone;
  slots: readonly TrainingSlot[];
  canManage: boolean;
}

export const HubRhythmPanel: FC<HubRhythmPanelProps> = ({ groupId, tone, slots, canManage }) => {
  const info = useRhythmSlotsInfo({ slots });
  const sentence = toRhythmSentence(slots);
  const isEmpty = slots.length === 0;

  const action: KkPanelAction | undefined = canManage
    ? {
        label: RHYTHM_ADD_LABEL,
        icon: 'add',
        ariaLabel: RHYTHM_ADD_ACTION_LABEL,
        component: Link,
        to: NEW_SLOT_ROUTE,
        params: { groupId: String(groupId) },
      }
    : undefined;

  const rows = slots.map((slot) => (
    <HubRhythmRow
      key={slot.groupTrainingSlotId}
      groupId={groupId}
      slot={slot}
      venueIsArchived={slot.venueId !== null && info.unavailableVenueIds.has(slot.venueId)}
    />
  ));

  const sentenceBlock =
    sentence === null ? null : (
      <KkPanel variant="block">
        <KkLead>{sentence}</KkLead>
      </KkPanel>
    );

  const list = isEmpty ? (
    <KkPanel variant="block">
      <KkEmptyState size="panel" title={RHYTHM_EMPTY_TITLE} description={RHYTHM_EMPTY_LINE} />
    </KkPanel>
  ) : (
    <KkPanel variant="list">{rows}</KkPanel>
  );

  const fullNote = canManage && info.isFull ? <KkNote>{RHYTHM_FULL_NOTE}</KkNote> : null;
  const archivedVenueNote =
    canManage && info.unavailableVenueIds.size > 0 ? (
      <KkNote tone="warning">{RHYTHM_ARCHIVED_VENUE_NOTE}</KkNote>
    ) : null;
  const meta = <KkMeta>{toRhythmMeta(slots.length)}</KkMeta>;

  const tools = canManage ? (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkNote>{RHYTHM_ADMIN_NOTE}</KkNote>
      <KkButton
        variant="outlined"
        component={Link}
        to={TRAININGS_ROUTE}
        params={{ groupId: String(groupId) }}
        startIcon={<KkIcon name="calendar" size="small" />}
      >
        {RHYTHM_GENERATE_LABEL}
      </KkButton>
      <KkMeta>{RHYTHM_GENERATE_HINT}</KkMeta>
      {fullNote}
      {archivedVenueNote}
    </Stack>
  ) : null;

  return (
    <KkPanelSection
      title={GROUP_SECTION_TITLES.rhythm}
      groupTone={tone}
      meta={meta}
      action={action}
    >
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        {sentenceBlock}
        {list}
        {tools}
      </Stack>
    </KkPanelSection>
  );
};
