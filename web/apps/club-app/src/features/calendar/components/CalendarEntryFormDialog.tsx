import {
  KkAlert,
  KkButton,
  KkDateField,
  KkModalFrame,
  KkNote,
  KkSelectField,
  KkSwitchRow,
  KkTextArea,
  KkTextField,
} from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useId } from 'react';
import type { ClubVenue } from '@/features/club';
import type { CalendarOwnerOption } from '../calendar-authoring';
import {
  CALENDAR_KIND_OPTIONS,
  CALENDAR_VISIBILITY_OPTIONS,
  toOwnerSelectOptions,
  toTimeOptions,
  toVenueOptions,
} from '../calendar-labels';
import { useCalendarEntryForm } from '../hooks/use-calendar-entry-form';
import type { CalendarEntry } from '../schemas';
import { CALENDAR_DESCRIPTION_MAX_LENGTH } from '../schemas';

const CREATE_TITLE = 'Termin eintragen';
const EDIT_TITLE = 'Termin bearbeiten';
const CREATE_KICKER = 'Kalender';
const CREATE_CONFIRM = 'Eintragen';
const EDIT_CONFIRM = 'Speichern';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const DONE_LABEL = 'Fertig';

const TITLE_LABEL = 'Titel';
const DESCRIPTION_LABEL = 'Beschreibung';
const DESCRIPTION_PLACEHOLDER = 'Was passiert, was mitbringen?';
const DESCRIPTION_ROWS = 4;
const OWNER_LABEL = 'Eigentümer';
const OWNER_HINT = 'Wem der Termin gehört — der Verein oder eine Gruppe. Nur der darf ihn ändern.';
const KIND_LABEL = 'Art';
const VENUE_LABEL = 'Ort';
const VENUE_HINT = 'Aus dem Ortsverzeichnis. Ohne Ort findet niemand eine Doppelbelegung.';
const START_DAY_LABEL = 'Tag';
const START_TIME_LABEL = 'Beginn';
const END_DAY_LABEL = 'Letzter Tag';
const END_DAY_EMPTY_LABEL = 'Offenes Ende';
const END_TIME_LABEL = 'Ende';
const VISIBILITY_LABEL = 'Sichtbarkeit';
const VISIBILITY_HINT =
  'Wer den Termin im Kalender sieht. Gesehen werden heißt nicht gemeint sein.';
const RESPONSE_LABEL = 'Nach Zu-/Absage fragen';
const RESPONSE_DESCRIPTION = 'Jeder, der den Termin sieht, kann zu- oder absagen.';
const CREATE_NOTE = 'Der Termin steht sofort im Kalender — bei allen, die ihn sehen dürfen.';

const FIELD_GAP = 2.25;
const GRID_SPACING = 2;
const DAY_SIZE = { xs: 12, sm: 7 };
const TIME_SIZE = { xs: 12, sm: 5 };

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface CalendarEntryFormDialogProps {
  entry: CalendarEntry | null;
  ownerOptions: readonly CalendarOwnerOption[];
  venues: readonly ClubVenue[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const CalendarEntryFormDialog: FC<CalendarEntryFormDialogProps> = ({
  entry,
  ownerOptions,
  venues,
  open,
  onClose,
  onSaved,
}) => {
  const titleId = useId();
  const control = useCalendarEntryForm({ entry, ownerOptions, open, onSaved });
  const titleField = control.form.register('title');
  const errors = control.form.formState.errors;

  const titleErrorText = errors.title?.message;
  const descriptionErrorText = errors.description?.message;
  const startDayErrorText = errors.startDay?.message;
  const endTimeErrorText = errors.endTime?.message;

  const title = control.isEditing ? EDIT_TITLE : CREATE_TITLE;
  const kicker = entry === null ? CREATE_KICKER : entry.title;
  const confirmLabel = control.isEditing ? EDIT_CONFIRM : CREATE_CONFIRM;
  const timeOptions = toTimeOptions();

  const intro = control.isEditing ? null : <KkNote>{CREATE_NOTE}</KkNote>;
  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;
  const collision =
    control.collisionWarning === null ? null : (
      <KkAlert severity="warning">{control.collisionWarning}</KkAlert>
    );
  const ownerField =
    ownerOptions.length < 2 ? null : (
      <KkSelectField
        name="ownerId"
        label={OWNER_LABEL}
        value={control.values.ownerId}
        options={toOwnerSelectOptions(ownerOptions)}
        onChange={control.setOwner}
        hint={OWNER_HINT}
      />
    );
  const closeLabel = control.collisionWarning === null ? CANCEL_LABEL : DONE_LABEL;
  const closeAction = control.collisionWarning === null ? onClose : onSaved;

  return (
    <KkModalFrame open={open} onClose={onClose} labelledBy={titleId} closeLabel={CLOSE_LABEL}>
      <KkModalFrame.Kicker>{kicker}</KkModalFrame.Kicker>
      <KkModalFrame.Title id={titleId}>{title}</KkModalFrame.Title>
      <KkModalFrame.Body>{intro}</KkModalFrame.Body>
      <KkModalFrame.Fields>
        <Stack sx={{ gap: FIELD_GAP, minWidth: 0 }}>
          <KkTextField
            name={titleField.name}
            label={TITLE_LABEL}
            error={titleErrorText !== undefined}
            helperText={titleErrorText}
            onChange={titleField.onChange}
            onBlur={titleField.onBlur}
            inputRef={titleField.ref}
          />
          {ownerField}
          <KkSelectField
            name="kind"
            label={KIND_LABEL}
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
        </Stack>
      </KkModalFrame.Fields>
      <KkModalFrame.Footer>
        {collision}
        {rejection}
        <KkButton variant="outlined" onClick={closeAction} disabled={control.isSaving}>
          {closeLabel}
        </KkButton>
        <KkButton onClick={control.submit} loading={control.isSaving}>
          {confirmLabel}
        </KkButton>
      </KkModalFrame.Footer>
    </KkModalFrame>
  );
};
