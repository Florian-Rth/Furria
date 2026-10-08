import type { KkSelectOption } from '@furria/ui';
import { KkDateField, KkNote, KkSelectField, KkTextArea, KkTextField } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import type { RunningVenue } from '@/features/calendar';
import { toTimeOptions } from '@/features/calendar';
import { EVENTS_ORIGIN } from '@/features/session';
import { WriteScreen } from '@/features/write';
import { toDoorsOptions, toEventVenueOptions } from '../event-form';
import { useEventEditor } from '../hooks/use-event-editor';
import type { EventDetails } from '../schemas';
import { EVENT_DESCRIPTION_MAX_LENGTH, EVENT_TEASER_MAX_LENGTH } from '../schemas';

const CREATE_TITLE = 'Veranstaltung anlegen';
const EDIT_TITLE = 'Veranstaltung bearbeiten';
const ADD_LABEL = 'Anlegen';
const SAVE_LABEL = 'Speichern';
const CREATE_NOTE =
  'Die Veranstaltung steht sofort auf der Website und im Kalender aller Mitglieder — mit „Vorverkauf wird noch angekündigt“, bis du einen Start setzt.';

const TITLE_LABEL = 'Titel';
const TEASER_LABEL = 'Anreißer';
const TEASER_PLACEHOLDER = 'Ein Satz, der Lust auf den Abend macht';
const TEASER_ROWS = 2;
const START_DAY_LABEL = 'Tag';
const START_TIME_LABEL = 'Beginn';
const END_DAY_LABEL = 'Letzter Tag';
const END_DAY_EMPTY_LABEL = 'Offenes Ende';
const END_TIME_LABEL = 'Ende';
const DOORS_LABEL = 'Einlass';
const VENUE_LABEL = 'Ort';
const VENUE_HINT = 'Die Website zeigt die Anschrift des Ortes.';
const DESCRIPTION_LABEL = 'Beschreibung';
const DESCRIPTION_PLACEHOLDER = 'Was die Gäste erwartet — ohne Formatierung';
const DESCRIPTION_ROWS = 5;
const AGE_HINT_LABEL = 'Altershinweis';
const PRICE_LABEL = 'Preis pro Karte';
const PRICE_HINT = 'In Euro. Leer lassen, solange er offen ist.';
const PRESALE_DAY_LABEL = 'Vorverkauf ab';
const PRESALE_DAY_EMPTY_LABEL = 'Noch nicht festgelegt';
const PRESALE_TIME_LABEL = 'Uhrzeit';
const PRESALE_HINT = 'Bis dahin zählt die Website die Tage bis zum Start herunter.';

const GRID_SPACING = 2;
const DAY_SIZE = { xs: 12, sm: 7 };
const TIME_SIZE = { xs: 12, sm: 5 };

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface EventEditorProps {
  event: EventDetails | null;
  venues: readonly RunningVenue[];
}

export const EventEditor: FC<EventEditorProps> = ({ event, venues }) => {
  const control = useEventEditor(event);
  const titleField = control.form.register('title');
  const ageHintField = control.form.register('ageHint');
  const priceField = control.form.register('price');
  const errors = control.form.formState.errors;
  const titleErrorText = errors.title?.message;
  const teaserErrorText = errors.teaser?.message;
  const startDayErrorText = errors.startDay?.message;
  const endTimeErrorText = errors.endTime?.message;
  const doorsOpenAtErrorText = errors.doorsOpenAt?.message;
  const venueIdErrorText = errors.venueId?.message;
  const descriptionErrorText = errors.description?.message;
  const ageHintErrorText = errors.ageHint?.message;

  const title = control.isEditing ? EDIT_TITLE : CREATE_TITLE;
  const actionLabel = control.isEditing ? SAVE_LABEL : ADD_LABEL;
  const origin =
    event === null
      ? EVENTS_ORIGIN
      : { label: event.title, to: '/events/$eventId', params: { eventId: String(event.eventId) } };
  const timeOptions = toTimeOptions();
  const doorsOptions: KkSelectOption[] = toDoorsOptions();
  const venueOptions = toEventVenueOptions(venues, event);
  const intro = control.isEditing ? null : <KkNote>{CREATE_NOTE}</KkNote>;
  const hasPriceError = errors.price !== undefined;
  const priceHelperText = errors.price?.message ?? PRICE_HINT;
  const hasPresaleError = errors.presaleTime !== undefined;
  const presaleHelperText = errors.presaleTime?.message ?? PRESALE_HINT;
  const hasNoEnd = control.values.endDay === '';
  const hasNoPresale = control.values.presaleDay === '';

  return (
    <WriteScreen
      origin={origin}
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
      <KkTextArea
        name="teaser"
        label={TEASER_LABEL}
        required
        value={control.values.teaser}
        onChange={control.setTeaser}
        rows={TEASER_ROWS}
        maxLength={EVENT_TEASER_MAX_LENGTH}
        showCount
        countLabel={toCountLabel}
        placeholder={TEASER_PLACEHOLDER}
        error={teaserErrorText !== undefined}
        helperText={teaserErrorText}
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
            disabled={hasNoEnd}
            error={endTimeErrorText !== undefined}
            helperText={endTimeErrorText}
          />
        </Grid>
      </Grid>
      <KkSelectField
        name="doorsOpenAt"
        label={DOORS_LABEL}
        value={control.values.doorsOpenAt}
        options={doorsOptions}
        onChange={control.setDoorsOpenAt}
        presentation="select"
        error={doorsOpenAtErrorText !== undefined}
        helperText={doorsOpenAtErrorText}
      />
      <KkSelectField
        name="venueId"
        label={VENUE_LABEL}
        required
        value={control.values.venueId}
        options={venueOptions}
        onChange={control.setVenue}
        presentation="select"
        hint={VENUE_HINT}
        error={venueIdErrorText !== undefined}
        helperText={venueIdErrorText}
      />
      <KkTextArea
        name="description"
        label={DESCRIPTION_LABEL}
        value={control.values.description}
        onChange={control.setDescription}
        rows={DESCRIPTION_ROWS}
        maxLength={EVENT_DESCRIPTION_MAX_LENGTH}
        showCount
        countLabel={toCountLabel}
        placeholder={DESCRIPTION_PLACEHOLDER}
        error={descriptionErrorText !== undefined}
        helperText={descriptionErrorText}
      />
      <KkTextField
        name={ageHintField.name}
        label={AGE_HINT_LABEL}
        error={ageHintErrorText !== undefined}
        helperText={ageHintErrorText}
        onChange={ageHintField.onChange}
        onBlur={ageHintField.onBlur}
        inputRef={ageHintField.ref}
      />
      <KkTextField
        name={priceField.name}
        label={PRICE_LABEL}
        inputMode="decimal"
        endAdornment="€"
        error={hasPriceError}
        helperText={priceHelperText}
        onChange={priceField.onChange}
        onBlur={priceField.onBlur}
        inputRef={priceField.ref}
      />
      <Grid container spacing={GRID_SPACING} sx={{ minWidth: 0 }}>
        <Grid size={DAY_SIZE} sx={{ minWidth: 0 }}>
          <KkDateField
            name="presaleDay"
            label={PRESALE_DAY_LABEL}
            value={control.values.presaleDay}
            onChange={control.setPresaleDay}
            allowEmpty
            emptyLabel={PRESALE_DAY_EMPTY_LABEL}
          />
        </Grid>
        <Grid size={TIME_SIZE} sx={{ minWidth: 0 }}>
          <KkSelectField
            name="presaleTime"
            label={PRESALE_TIME_LABEL}
            value={control.values.presaleTime}
            options={timeOptions}
            onChange={control.setPresaleTime}
            presentation="select"
            disabled={hasNoPresale}
            error={hasPresaleError}
            helperText={presaleHelperText}
          />
        </Grid>
      </Grid>
    </WriteScreen>
  );
};
