import { KkAlert, KkButton, KkModalFrame, KkNote, KkSelectField } from '@furria/ui';
import type { FC } from 'react';
import { useId } from 'react';
import { toTimeOptions, useRunningVenuesQuery } from '@/features/calendar';
import { useRhythmSlotForm } from '../hooks/use-rhythm-slot-form';
import {
  SLOT_CANCEL_LABEL,
  SLOT_CLOSE_LABEL,
  SLOT_CONFIRM_LABEL,
  SLOT_DIALOG_ADD_TITLE,
  SLOT_DIALOG_EDIT_TITLE,
  SLOT_DURATION_LABEL,
  SLOT_START_LABEL,
  SLOT_VENUE_HINT,
  SLOT_VENUE_LABEL,
  SLOT_WEEKDAY_LABEL,
  toDurationOptions,
  toHeldVenue,
  toRhythmVenueOptions,
  WEEKDAY_OPTIONS,
} from '../rhythm-labels';
import type { TrainingSlot, TrainingSlotForm } from '../schemas';

interface RhythmSlotDialogProps {
  groupName: string;
  open: boolean;
  slot: TrainingSlot | null;
  isSaving: boolean;
  rejection: string | null;
  onClose: () => void;
  onSubmit: (form: TrainingSlotForm) => void;
}

export const RhythmSlotDialog: FC<RhythmSlotDialogProps> = ({
  groupName,
  open,
  slot,
  isSaving,
  rejection,
  onClose,
  onSubmit,
}) => {
  const titleId = useId();
  const venues = useRunningVenuesQuery();
  const form = useRhythmSlotForm({ open, slot, onSubmit });
  const title = slot === null ? SLOT_DIALOG_ADD_TITLE : SLOT_DIALOG_EDIT_TITLE;
  const venueOptions = toRhythmVenueOptions(venues.data?.venues ?? null, toHeldVenue(slot));
  const timeOptions = toTimeOptions();
  const durationOptions = toDurationOptions();

  const failure = rejection === null ? null : <KkAlert severity="error">{rejection}</KkAlert>;

  return (
    <KkModalFrame open={open} onClose={onClose} labelledBy={titleId} closeLabel={SLOT_CLOSE_LABEL}>
      <KkModalFrame.Kicker>{groupName}</KkModalFrame.Kicker>
      <KkModalFrame.Title id={titleId}>{title}</KkModalFrame.Title>
      <KkModalFrame.Fields>
        <KkSelectField
          name="weekday"
          label={SLOT_WEEKDAY_LABEL}
          value={form.weekday}
          options={WEEKDAY_OPTIONS}
          onChange={form.setWeekday}
          presentation="select"
        />
        <KkSelectField
          name="startsAt"
          label={SLOT_START_LABEL}
          value={form.startsAt}
          options={timeOptions}
          onChange={form.setStartsAt}
          presentation="select"
        />
        <KkSelectField
          name="durationMinutes"
          label={SLOT_DURATION_LABEL}
          value={form.durationMinutes}
          options={durationOptions}
          onChange={form.setDurationMinutes}
          presentation="select"
        />
        <KkSelectField
          name="venueId"
          label={SLOT_VENUE_LABEL}
          value={form.venueId}
          options={venueOptions}
          onChange={form.setVenueId}
          presentation="select"
        />
        <KkNote>{SLOT_VENUE_HINT}</KkNote>
      </KkModalFrame.Fields>
      <KkModalFrame.Footer>
        {failure}
        <KkButton variant="outlined" onClick={onClose} disabled={isSaving}>
          {SLOT_CANCEL_LABEL}
        </KkButton>
        <KkButton onClick={form.submit} loading={isSaving} disabled={!form.canSubmit}>
          {SLOT_CONFIRM_LABEL}
        </KkButton>
      </KkModalFrame.Footer>
    </KkModalFrame>
  );
};
