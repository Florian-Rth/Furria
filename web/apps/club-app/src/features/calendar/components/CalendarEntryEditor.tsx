import {
  KkDateField,
  KkMultiSelectField,
  KkNote,
  KkSelectField,
  KkSwitchRow,
  KkTextArea,
  KkTextField,
  KkWriteScreen,
} from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import type { CalendarOwnerOption, CalendarParticipantPool } from '../calendar-authoring';
import { toParticipantsEmptyLabel, toParticipatingGroupOptions } from '../calendar-authoring';
import {
  CALENDAR_ENTRY_CREATE_TITLE,
  CALENDAR_ENTRY_EDIT_TITLE,
  CALENDAR_KIND_OPTIONS,
  CALENDAR_ORIGIN,
  CALENDAR_VISIBILITY_OPTIONS,
  DELETE_ENTRY_DANGER_LABEL,
  toOwnerSelectOptions,
  toTimeOptions,
  toVenueOptions,
} from '../calendar-labels';
import { useCalendarEntryEditor } from '../hooks/use-calendar-entry-editor';
import { useCalendarEntryRemoval } from '../hooks/use-calendar-entry-removal';
import type { CalendarEntry, ParticipatingGroup, RunningVenue } from '../schemas';
import { CALENDAR_DESCRIPTION_MAX_LENGTH } from '../schemas';
import { DeleteCalendarEntryDialog } from './DeleteCalendarEntryDialog';

const ADD_LABEL = 'Hinzufügen';
const SAVE_LABEL = 'Speichern';

const TITLE_LABEL = 'Titel';
const DESCRIPTION_LABEL = 'Beschreibung';
const DESCRIPTION_PLACEHOLDER = 'Weitere Informationen zum Termin';
const DESCRIPTION_ROWS = 4;
const OWNER_LABEL = 'Eigentümer';
const OWNER_HINT = 'Nur der Eigentümer kann den Termin bearbeiten.';
const KIND_LABEL = 'Art';
const PARTICIPANTS_LABEL = 'Mitwirkende Gruppen';
const PARTICIPANTS_HINT = 'Der Termin erscheint zusätzlich bei diesen Gruppen.';
const VENUE_LABEL = 'Ort';
const VENUE_HINT = 'Nur mit Ort werden Doppelbelegungen erkannt.';
const START_DAY_LABEL = 'Tag';
const START_TIME_LABEL = 'Beginn';
const END_DAY_LABEL = 'Letzter Tag';
const END_DAY_EMPTY_LABEL = 'Offenes Ende';
const END_TIME_LABEL = 'Ende';
const VISIBILITY_LABEL = 'Sichtbarkeit';
const VISIBILITY_HINT = 'Legt fest, wer den Termin sieht.';
const RESPONSE_LABEL = 'Nach Zu-/Absage fragen';
const RESPONSE_DESCRIPTION = 'Alle, die den Termin sehen, können zu- oder absagen.';
const CREATE_NOTE = 'Der Termin ist sofort für alle Berechtigten sichtbar.';

const GRID_SPACING = 2;
const DAY_SIZE = { xs: 12, sm: 7 };
const TIME_SIZE = { xs: 12, sm: 5 };

const NO_PARTICIPANTS: readonly ParticipatingGroup[] = [];

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface CalendarEntryEditorProps {
  entry: CalendarEntry | null;
  ownerOptions: readonly CalendarOwnerOption[];
  clubGroups: CalendarParticipantPool;
  venues: readonly RunningVenue[];
}

export const CalendarEntryEditor: FC<CalendarEntryEditorProps> = ({
  entry,
  ownerOptions,
  clubGroups,
  venues,
}) => {
  const control = useCalendarEntryEditor({ entry, ownerOptions });
  const danger = useCalendarEntryRemoval(entry);
  const titleField = control.form.register('title');
  const errors = control.form.formState.errors;

  const titleErrorText = errors.title?.message;
  const descriptionErrorText = errors.description?.message;
  const startDayErrorText = errors.startDay?.message;
  const endTimeErrorText = errors.endTime?.message;

  const title = control.isEditing ? CALENDAR_ENTRY_EDIT_TITLE : CALENDAR_ENTRY_CREATE_TITLE;
  const actionLabel = control.isEditing ? SAVE_LABEL : ADD_LABEL;
  const timeOptions = toTimeOptions();
  const heldParticipants = entry?.participatingGroups ?? NO_PARTICIPANTS;
  const participantOptions = toParticipatingGroupOptions(
    clubGroups,
    heldParticipants,
    control.values.ownerId,
  );
  const participantsEmptyLabel = toParticipantsEmptyLabel(clubGroups);
  const participantsErrorText = errors.participatingGroupIds?.message;

  const intro = control.isEditing ? null : <KkNote>{CREATE_NOTE}</KkNote>;
  const ownerField =
    ownerOptions.length < 2 ? null : (
      <KkSelectField
        name="ownerId"
        label={OWNER_LABEL}
        required
        value={control.values.ownerId}
        options={toOwnerSelectOptions(ownerOptions)}
        onChange={control.setOwner}
        hint={OWNER_HINT}
      />
    );

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
      <KkTextField
        name={titleField.name}
        label={TITLE_LABEL}
        required
        error={titleErrorText !== undefined}
        helperText={titleErrorText}
        onChange={titleField.onChange}
        onBlur={titleField.onBlur}
        inputRef={titleField.ref}
      />
      {ownerField}
      <KkMultiSelectField
        name="participatingGroupIds"
        label={PARTICIPANTS_LABEL}
        values={control.values.participatingGroupIds}
        options={participantOptions}
        onToggle={control.toggleParticipatingGroup}
        emptyLabel={participantsEmptyLabel}
        hint={PARTICIPANTS_HINT}
        error={participantsErrorText !== undefined}
        helperText={participantsErrorText}
      />
      <KkSelectField
        name="kind"
        label={KIND_LABEL}
        required
        value={control.values.kind}
        options={CALENDAR_KIND_OPTIONS}
        onChange={control.setKind}
        presentation="select"
      />
      <KkSelectField
        name="venueId"
        label={VENUE_LABEL}
        value={control.values.venueId}
        options={toVenueOptions(venues)}
        onChange={control.setVenue}
        presentation="select"
        hint={VENUE_HINT}
      />
      <Grid container spacing={GRID_SPACING} sx={{ minWidth: 0 }}>
        <Grid size={DAY_SIZE} sx={{ minWidth: 0 }}>
          <KkDateField
            name="startDay"
            label={START_DAY_LABEL}
            required
            value={control.values.startDay}
            onChange={control.setStartDay}
            error={startDayErrorText !== undefined}
            helperText={startDayErrorText}
          />
        </Grid>
        <Grid size={TIME_SIZE} sx={{ minWidth: 0 }}>
          <KkSelectField
            name="startTime"
            label={START_TIME_LABEL}
            required
            value={control.values.startTime}
            options={timeOptions}
            onChange={control.setStartTime}
            presentation="select"
          />
        </Grid>
        <Grid size={DAY_SIZE} sx={{ minWidth: 0 }}>
          <KkDateField
            name="endDay"
            label={END_DAY_LABEL}
            value={control.values.endDay}
            onChange={control.setEndDay}
            allowEmpty
            emptyLabel={END_DAY_EMPTY_LABEL}
          />
        </Grid>
        <Grid size={TIME_SIZE} sx={{ minWidth: 0 }}>
          <KkSelectField
            name="endTime"
            label={END_TIME_LABEL}
            value={control.values.endTime}
            options={timeOptions}
            onChange={control.setEndTime}
            presentation="select"
            disabled={control.values.endDay === ''}
            error={endTimeErrorText !== undefined}
            helperText={endTimeErrorText}
          />
        </Grid>
      </Grid>
      <KkSelectField
        name="visibility"
        label={VISIBILITY_LABEL}
        required
        value={control.values.visibility}
        options={CALENDAR_VISIBILITY_OPTIONS}
        onChange={control.setVisibility}
        hint={VISIBILITY_HINT}
      />
      <KkTextArea
        name="description"
        label={DESCRIPTION_LABEL}
        value={control.values.description}
        onChange={control.setDescription}
        rows={DESCRIPTION_ROWS}
        maxLength={CALENDAR_DESCRIPTION_MAX_LENGTH}
        showCount
        countLabel={toCountLabel}
        placeholder={DESCRIPTION_PLACEHOLDER}
        error={descriptionErrorText !== undefined}
        helperText={descriptionErrorText}
      />
      <KkSwitchRow
        label={RESPONSE_LABEL}
        checked={control.values.asksForResponse}
        onChange={control.setAsksForResponse}
        description={RESPONSE_DESCRIPTION}
      />
      {dangerLine}
    </WriteScreen>
  );
};
