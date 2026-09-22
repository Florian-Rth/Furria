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
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups';
import { toRhythmSentence } from '@/features/groups';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { useRhythmSlots } from '../hooks/use-rhythm-slots';
import { useTrainingGenerator } from '../hooks/use-training-generator';
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
import { RhythmSlotDialog } from './RhythmSlotDialog';
import { TrainingGeneratorSheet } from './TrainingGeneratorSheet';

interface HubRhythmPanelProps {
  groupId: number;
  groupName: string;
  tone: GroupTone;
  slots: readonly TrainingSlot[];
  canManage: boolean;
}

export const HubRhythmPanel: FC<HubRhythmPanelProps> = ({
  groupId,
  groupName,
  tone,
  slots,
  canManage,
}) => {
  const rhythm = useRhythmSlots({ groupId, slots });
  const generator = useTrainingGenerator(groupId);
  const sentence = toRhythmSentence(slots);
  const isEmpty = slots.length === 0;

  const action: KkPanelAction | undefined = canManage
    ? {
        label: RHYTHM_ADD_LABEL,
        icon: 'add',
        ariaLabel: RHYTHM_ADD_ACTION_LABEL,
        onClick: rhythm.openAdd,
        disabled: !rhythm.canAdd,
      }
    : undefined;

  const rows = slots.map((slot) => (
    <HubRhythmRow
      key={slot.groupTrainingSlotId}
      slot={slot}
      canManage={canManage}
      venueIsArchived={slot.venueId !== null && rhythm.unavailableVenueIds.has(slot.venueId)}
      onEdit={rhythm.openEdit}
      onRemove={rhythm.remove}
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

  const fullNote = canManage && !rhythm.canAdd ? <KkNote>{RHYTHM_FULL_NOTE}</KkNote> : null;
  const archivedVenueNote =
    canManage && rhythm.unavailableVenueIds.size > 0 ? (
      <KkNote tone="warning">{RHYTHM_ARCHIVED_VENUE_NOTE}</KkNote>
    ) : null;
  const meta = <KkMeta>{toRhythmMeta(slots.length)}</KkMeta>;

  const tools = canManage ? (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkNote>{RHYTHM_ADMIN_NOTE}</KkNote>
      <KkButton
        variant="outlined"
        startIcon={<KkIcon name="calendar" size="small" />}
        onClick={generator.open}
        disabled={isEmpty}
      >
        {RHYTHM_GENERATE_LABEL}
      </KkButton>
      <KkMeta>{RHYTHM_GENERATE_HINT}</KkMeta>
      {fullNote}
      {archivedVenueNote}
    </Stack>
  ) : null;

  const writes = canManage ? (
    <>
      <RhythmSlotDialog
        groupName={groupName}
        open={rhythm.isDialogOpen}
        slot={rhythm.edited}
        isSaving={rhythm.isSaving}
        rejection={rhythm.rejection}
        onClose={rhythm.closeDialog}
        onSubmit={rhythm.save}
      />
      <TrainingGeneratorSheet control={generator} hasRhythm={!isEmpty} />
    </>
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
      {writes}
    </KkPanelSection>
  );
};
