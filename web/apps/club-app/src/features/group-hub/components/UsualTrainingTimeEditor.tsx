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
import { useUsualTrainingTimeEditor } from '../hooks/use-usual-training-time-editor';
import type { GroupHub, UsualTrainingTime } from '../schemas';
import {
  toDurationOptions,
  toHeldVenue,
  toUsualTimeRemoveFacts,
  toUsualTimesVenueOptions,
  USUAL_TIME_DIALOG_ADD_TITLE,
  USUAL_TIME_DIALOG_EDIT_TITLE,
  USUAL_TIME_DURATION_LABEL,
  USUAL_TIME_REMOVE_EXPLANATION,
  USUAL_TIME_REMOVE_EYEBROW,
  USUAL_TIME_REMOVE_LABEL,
  USUAL_TIME_START_LABEL,
  USUAL_TIME_VENUE_HINT,
  USUAL_TIME_VENUE_LABEL,
  USUAL_TIME_WEEKDAY_LABEL,
  WEEKDAY_OPTIONS,
} from '../usual-training-time-labels';
import { GroupEditorError } from './GroupEditorError';
import { GroupEditorSkeleton } from './GroupEditorSkeleton';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';
const REMOVE_QUESTION = 'Trainingszeit entfernen?';
const SECTION_TITLE = 'Trainingszeit';
const QUICK_TIMES = ['17:00', '18:00', '19:00', '19:11'] as const;
const DURATION_OPTIONS = toDurationOptions();

interface UsualTrainingTimeEditorProps {
  hub: GroupHub;
  usualTime: UsualTrainingTime | null;
}

export const UsualTrainingTimeEditor: FC<UsualTrainingTimeEditorProps> = ({ hub, usualTime }) => {
  const control = useUsualTrainingTimeEditor({
    groupId: hub.groupId,
    usualTime,
    usualTimes: hub.usualTrainingTimes,
  });
  const venues = useRunningVenuesQuery();
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const title = usualTime === null ? USUAL_TIME_DIALOG_ADD_TITLE : USUAL_TIME_DIALOG_EDIT_TITLE;
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

  const venueOptions = toUsualTimesVenueOptions(venues.data.venues, toHeldVenue(usualTime));
  const runningVenueIds = new Set(venues.data.venues.map((venue) => venue.venueId));
  const venueIsArchived =
    usualTime !== null && usualTime.venueId !== null && !runningVenueIds.has(usualTime.venueId);

  const danger =
    usualTime === null ? null : (
      <KkWriteScreen.Danger label={USUAL_TIME_REMOVE_LABEL} onSelect={openRemoveConfirm} />
    );

  const confirm =
    usualTime === null ? null : (
      <KkConfirmDialog
        open={confirmingRemove}
        onClose={closeRemoveConfirm}
        onConfirm={control.remove}
        tone="danger"
        eyebrow={USUAL_TIME_REMOVE_EYEBROW}
        question={REMOVE_QUESTION}
        explanation={USUAL_TIME_REMOVE_EXPLANATION}
        facts={toUsualTimeRemoveFacts(usualTime, venueIsArchived)}
        error={control.rejection ?? undefined}
        confirmLabel={USUAL_TIME_REMOVE_LABEL}
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
          label={USUAL_TIME_WEEKDAY_LABEL}
          value={control.weekday}
          options={WEEKDAY_OPTIONS}
          onChange={control.setWeekday}
          presentation="choices"
          required
        />
        <KkTimeField
          name="startsAt"
          label={USUAL_TIME_START_LABEL}
          value={control.startsAt}
          onChange={control.setStartsAt}
          quickTimes={QUICK_TIMES}
          required
        />
        <KkSelectField
          name="durationMinutes"
          label={USUAL_TIME_DURATION_LABEL}
          value={control.durationMinutes}
          options={DURATION_OPTIONS}
          onChange={control.setDurationMinutes}
          presentation="choices"
          required
        />
        <KkSelectField
          name="venueId"
          label={USUAL_TIME_VENUE_LABEL}
          value={control.venueId}
          options={venueOptions}
          onChange={control.setVenueId}
          presentation="select"
          hint={USUAL_TIME_VENUE_HINT}
        />
      </KkFormSection>
      {danger}
      {confirm}
    </WriteScreen>
  );
};
