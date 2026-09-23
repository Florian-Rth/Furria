import { KkConfirmDialog, KkNote, KkSelectField, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { useState } from 'react';
import { toTimeOptions, useRunningVenuesQuery } from '@/features/calendar';
import { WriteScreen } from '@/features/write';
import { toHubEditorOrigin } from '../group-hub-labels';
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

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';
const REMOVE_QUESTION = 'Trainingszeit entfernen?';

interface GroupSlotEditorProps {
  hub: GroupHub;
  slot: TrainingSlot | null;
}

export const GroupSlotEditor: FC<GroupSlotEditorProps> = ({ hub, slot }) => {
  const control = useGroupSlotEditor({ groupId: hub.groupId, slot, slots: hub.trainingSlots });
  const venues = useRunningVenuesQuery();
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const title = slot === null ? SLOT_DIALOG_ADD_TITLE : SLOT_DIALOG_EDIT_TITLE;
  const venueOptions = toRhythmVenueOptions(venues.data?.venues ?? null, toHeldVenue(slot));
  const runningVenueIds = new Set((venues.data?.venues ?? []).map((venue) => venue.venueId));
  const venueIsArchived =
    slot !== null && slot.venueId !== null && !runningVenueIds.has(slot.venueId);

  const openRemoveConfirm = (): void => {
    setConfirmingRemove(true);
  };

  const closeRemoveConfirm = (): void => {
    setConfirmingRemove(false);
  };

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
      origin={toHubEditorOrigin(hub)}
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
      <KkSelectField
        name="weekday"
        label={SLOT_WEEKDAY_LABEL}
        value={control.weekday}
        options={WEEKDAY_OPTIONS}
        onChange={control.setWeekday}
        presentation="select"
        required
      />
      <KkSelectField
        name="startsAt"
        label={SLOT_START_LABEL}
        value={control.startsAt}
        options={toTimeOptions()}
        onChange={control.setStartsAt}
        presentation="select"
        required
      />
      <KkSelectField
        name="durationMinutes"
        label={SLOT_DURATION_LABEL}
        value={control.durationMinutes}
        options={toDurationOptions()}
        onChange={control.setDurationMinutes}
        presentation="select"
        required
      />
      <KkSelectField
        name="venueId"
        label={SLOT_VENUE_LABEL}
        value={control.venueId}
        options={venueOptions}
        onChange={control.setVenueId}
        presentation="select"
      />
      <KkNote>{SLOT_VENUE_HINT}</KkNote>
      {danger}
      {confirm}
    </WriteScreen>
  );
};
