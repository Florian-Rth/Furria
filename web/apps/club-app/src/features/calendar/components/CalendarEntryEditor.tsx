import { KkWriteScreen } from '@furria/ui/KkWriteScreen';
import type { FC } from 'react';
import { CALENDAR_ORIGIN } from '@/features/session/app-sections';
import { WriteScreen } from '@/features/write/WriteScreen';
import type { CalendarOwnerOption, CalendarParticipantPool } from '../calendar-authoring';
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
import type { AudienceGroup, AudiencePerson, CalendarEntry, RunningVenue } from '../schemas';
import { CalendarEntryAddOnsSection } from './CalendarEntryAddOnsSection';
import { CalendarEntryAudienceSection } from './CalendarEntryAudienceSection';
import { CalendarEntryBasicsSection } from './CalendarEntryBasicsSection';
import { CalendarEntryDescriptionSection } from './CalendarEntryDescriptionSection';
import { CalendarEntryScheduleSection } from './CalendarEntryScheduleSection';
import { DeleteCalendarEntryDialog } from './DeleteCalendarEntryDialog';

const ADD_LABEL = 'Hinzufügen';
const SAVE_LABEL = 'Speichern';

const NO_GROUPS: readonly AudienceGroup[] = [];
const NO_PEOPLE: readonly AudiencePerson[] = [];

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
  const heldGroups = entry?.audienceGroups ?? NO_GROUPS;
  const heldPeople = entry?.audiencePeople ?? NO_PEOPLE;
  const groupsReload = clubGroups.state === 'failed' ? clubGroupsReload : null;
  const ownerSelectOptions = toOwnerSelectOptions(ownerOptions);
  const venueOptions = toVenueOptions(venues);

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
      <CalendarEntryBasicsSection control={control} />
      <CalendarEntryScheduleSection control={control} venueOptions={venueOptions} />
      <CalendarEntryAudienceSection
        control={control}
        ownerOptions={ownerSelectOptions}
        heldGroups={heldGroups}
        heldPeople={heldPeople}
        clubGroups={clubGroups}
        clubGroupsReload={groupsReload}
      />
      <CalendarEntryDescriptionSection control={control} />
      <CalendarEntryAddOnsSection
        control={control}
        entry={entry}
        clubGroups={clubGroups}
        clubGroupsReload={groupsReload}
      />
      {dangerLine}
    </WriteScreen>
  );
};
