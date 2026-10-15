import { KkNote, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { CALENDAR_ORIGIN } from '@/features/session';
import { WriteScreen } from '@/features/write';
import type { CalendarOwnerOption, CalendarParticipantPool } from '../calendar-authoring';
import { toParticipantsEmptyLabel, toParticipatingGroupOptions } from '../calendar-authoring';
import {
  CALENDAR_ENTRY_CREATE_TITLE,
  CALENDAR_ENTRY_EDIT_TITLE,
  DELETE_ENTRY_DANGER_LABEL,
  toOwnerSelectOptions,
  toVenueOptions,
} from '../calendar-labels';
import { useCalendarEntryEditor } from '../hooks/use-calendar-entry-editor';
import { useCalendarEntryRemoval } from '../hooks/use-calendar-entry-removal';
import type { CalendarEntryReload } from '../hooks/use-calendar-entry-supplies';
import type { CalendarEntry, ParticipatingGroup, RunningVenue } from '../schemas';
import { CalendarEntryAudienceSection } from './CalendarEntryAudienceSection';
import { CalendarEntryBasicsSection } from './CalendarEntryBasicsSection';
import { CalendarEntryScheduleSection } from './CalendarEntryScheduleSection';
import { DeleteCalendarEntryDialog } from './DeleteCalendarEntryDialog';

const ADD_LABEL = 'Hinzufügen';
const SAVE_LABEL = 'Speichern';
const CREATE_NOTE = 'Der Termin ist sofort für alle Berechtigten sichtbar.';

const NO_PARTICIPANTS: readonly ParticipatingGroup[] = [];

interface CalendarEntryEditorProps {
  entry: CalendarEntry | null;
  ownerOptions: readonly CalendarOwnerOption[];
  clubGroups: CalendarParticipantPool;
  clubGroupsReload: CalendarEntryReload;
  venues: readonly RunningVenue[];
}

export const CalendarEntryEditor: FC<CalendarEntryEditorProps> = ({
  entry,
  ownerOptions,
  clubGroups,
  clubGroupsReload,
  venues,
}) => {
  const control = useCalendarEntryEditor({ entry, ownerOptions });
  const danger = useCalendarEntryRemoval(entry);

  const title = control.isEditing ? CALENDAR_ENTRY_EDIT_TITLE : CALENDAR_ENTRY_CREATE_TITLE;
  const actionLabel = control.isEditing ? SAVE_LABEL : ADD_LABEL;
  const heldParticipants = entry?.participatingGroups ?? NO_PARTICIPANTS;
  const participantOptions = toParticipatingGroupOptions(
    clubGroups,
    heldParticipants,
    control.values.ownerId,
  );
  const participantsEmptyLabel = toParticipantsEmptyLabel(clubGroups);
  const participantsReload = clubGroups.state === 'failed' ? clubGroupsReload : null;
  const ownerSelectOptions = toOwnerSelectOptions(ownerOptions);
  const venueOptions = toVenueOptions(venues);

  const intro = control.isEditing ? null : <KkNote>{CREATE_NOTE}</KkNote>;
  const dangerLine =
    entry === null ? null : (
      <>
        <KkWriteScreen.Danger label={DELETE_ENTRY_DANGER_LABEL} onSelect={danger.open} />
        <DeleteCalendarEntryDialog entry={entry} control={danger} />
      </>
    );

  return (
    <WriteScreen
      origin={CALENDAR_ORIGIN}
      title={title}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: {
          label: actionLabel,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      {intro}
      <CalendarEntryBasicsSection control={control} />
      <CalendarEntryScheduleSection control={control} venueOptions={venueOptions} />
      <CalendarEntryAudienceSection
        control={control}
        ownerOptions={ownerSelectOptions}
        participantOptions={participantOptions}
        participantsEmptyLabel={participantsEmptyLabel}
        participantsReload={participantsReload}
      />
      {dangerLine}
    </WriteScreen>
  );
};
