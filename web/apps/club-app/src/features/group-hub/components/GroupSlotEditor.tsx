import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkTimeField } from '@furria/ui/KkTimeField';
import { KkWriteScreen } from '@furria/ui/KkWriteScreen';
import type { FC } from 'react';
import { useState } from 'react';
import { useRunningVenuesQuery } from '@/features/calendar/api';
import { WriteScreen } from '@/features/write/WriteScreen';
import { toHubEditorOrigin } from '../group-hub-labels';
import { toEditorChoicesErrorMessage } from '../group-hub-messages';
import { useGroupSlotEditor } from '../hooks/use-group-slot-editor';
import {
  SLOT_DIALOG_ADD_TITLE,
  SLOT_DIALOG_EDIT_TITLE,
  SLOT_DURATION_LABEL,
  SLOT_REMOVE_EXPLANATION,
  SLOT_REMOVE_EYEBROW,
  SLOT_REMOVE_LABEL,
  SLOT_START_LABEL,
  SLOT_VENUE_HINT,
  SLOT_VENUE_LABEL,
  SLOT_WEEKDAY_LABEL,
  toDurationOptions,
  toHeldVenue,
  toRhythmVenueOptions,
  toSlotRemoveFacts,
  WEEKDAY_OPTIONS,
} from '../rhythm-labels';
import type { GroupHub, TrainingSlot } from '../schemas';
import { GroupEditorError } from './GroupEditorError';
import { GroupEditorSkeleton } from './GroupEditorSkeleton';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';
const REMOVE_QUESTION = 'Trainingszeit entfernen?';
const SECTION_TITLE = 'Trainingszeit';
const QUICK_TIMES = ['17:00', '18:00', '19:00', '19:11'] as const;
const DURATION_OPTIONS = toDurationOptions();

interface GroupSlotEditorProps {
  hub: GroupHub;
  slot: TrainingSlot | null;
}

export const GroupSlotEditor: FC<GroupSlotEditorProps> = ({ hub, slot }) => {
  const control = useGroupSlotEditor({ groupId: hub.groupId, slot, slots: hub.trainingSlots });
  const venues = useRunningVenuesQuery();
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const title = slot === null ? SLOT_DIALOG_ADD_TITLE : SLOT_DIALOG_EDIT_TITLE;
  const origin = toHubEditorOrigin(hub);

  const openRemoveConfirm = (): void => {
    setConfirmingRemove(true);
  };

  const closeRemoveConfirm = (): void => {
    setConfirmingRemove(false);
  };

  const reloadVenues = (): void => {
    void venues.refetch();
  };

  if (venues.data === undefined) {
    if (venues.error === null) {
      return <GroupEditorSkeleton />;
    }

    const venuesErrorMessage = toEditorChoicesErrorMessage(venues.error);

    return (
      <GroupEditorError
        title={title}
        origin={origin}
        message={venuesErrorMessage}
        onRetry={reloadVenues}
      />
    );
  }

  const venueOptions = toRhythmVenueOptions(venues.data.venues, toHeldVenue(slot));
  const runningVenueIds = new Set(venues.data.venues.map((venue) => venue.venueId));
  const venueIsArchived =
    slot !== null && slot.venueId !== null && !runningVenueIds.has(slot.venueId);

  const danger =
    slot === null ? null : (
      <KkWriteScreen.Danger label={SLOT_REMOVE_LABEL} onSelect={openRemoveConfirm} />
    );

  const confirm =
    slot === null ? null : (
      <KkConfirmDialog
        open={confirmingRemove}
        onClose={closeRemoveConfirm}
        onConfirm={control.remove}
        tone="danger"
        eyebrow={SLOT_REMOVE_EYEBROW}
        question={REMOVE_QUESTION}
        explanation={SLOT_REMOVE_EXPLANATION}
        facts={toSlotRemoveFacts(slot, venueIsArchived)}
        error={control.rejection ?? undefined}
        confirmLabel={SLOT_REMOVE_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={control.isSaving}
      />
    );

  return (
    <WriteScreen
      origin={origin}
      title={title}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: {
          label: control.actionLabel,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      <KkFormSection title={SECTION_TITLE}>
        <KkSelectField
          name="weekday"
          label={SLOT_WEEKDAY_LABEL}
          value={control.weekday}
          options={WEEKDAY_OPTIONS}
          onChange={control.setWeekday}
          presentation="choices"
          required
        />
        <KkTimeField
          name="startsAt"
          label={SLOT_START_LABEL}
          value={control.startsAt}
          onChange={control.setStartsAt}
          quickTimes={QUICK_TIMES}
          required
        />
        <KkSelectField
          name="durationMinutes"
          label={SLOT_DURATION_LABEL}
          value={control.durationMinutes}
          options={DURATION_OPTIONS}
          onChange={control.setDurationMinutes}
          presentation="choices"
          required
        />
        <KkSelectField
          name="venueId"
          label={SLOT_VENUE_LABEL}
          value={control.venueId}
          options={venueOptions}
          onChange={control.setVenueId}
          presentation="select"
          hint={SLOT_VENUE_HINT}
        />
      </KkFormSection>
      {danger}
      {confirm}
    </WriteScreen>
  );
};
