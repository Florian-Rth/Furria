import { KkNote, KkTextArea, KkTextField } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import { useVenueEditor } from '../hooks/use-venue-editor';
import { VENUES_ORIGIN } from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';
import { VENUE_HINT_MAX_LENGTH } from '../schemas';

const CREATE_TITLE = 'Ort hinzufügen';
const EDIT_TITLE = 'Ort bearbeiten';
const ADD_LABEL = 'Hinzufügen';
const SAVE_LABEL = 'Speichern';

const NAME_LABEL = 'Name des Ortes';
const STREET_LABEL = 'Straße und Hausnummer';
const ZIP_LABEL = 'PLZ';
const CITY_LABEL = 'Stadt';
const HINT_LABEL = 'Hinweis';
const HINT_PLACEHOLDER = 'Optional';
const HINT_HINT = 'Ergänzende Hinweise zu Anfahrt oder Zugang.';
const HINT_ROWS = 3;
const CREATE_NOTE = 'Die Anschrift erscheint im Kalender, bei den Schlüsseln und auf der Website.';

const FIELD_GAP = 2.25;
const ZIP_SIZE = { xs: 4, sm: 3 };
const CITY_SIZE = { xs: 8, sm: 9 };
const GRID_SPACING = 2;

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface VenueEditorProps {
  venue: ManagedVenue | null;
}

export const VenueEditor: FC<VenueEditorProps> = ({ venue }) => {
  const control = useVenueEditor(venue);
  const nameField = control.form.register('name');
  const streetField = control.form.register('street');
  const zipField = control.form.register('zip');
  const cityField = control.form.register('city');
  const errors = control.form.formState.errors;

  const nameErrorText = errors.name?.message;
  const streetErrorText = errors.street?.message;
  const zipErrorText = errors.zip?.message;
  const cityErrorText = errors.city?.message;
  const hintErrorText = errors.hint?.message;

  const isEditing = venue !== null;
  const title = isEditing ? EDIT_TITLE : CREATE_TITLE;
  const actionLabel = isEditing ? SAVE_LABEL : ADD_LABEL;
  const origin = isEditing
    ? {
        label: venue.name,
        to: '/manage/venues/$venueId',
        params: { venueId: String(venue.venueId) },
      }
    : VENUES_ORIGIN;
  const intro = isEditing ? null : <KkNote>{CREATE_NOTE}</KkNote>;

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
      <Stack sx={{ gap: FIELD_GAP, minWidth: 0 }}>
        <KkTextField
          name={nameField.name}
          label={NAME_LABEL}
          required
          error={nameErrorText !== undefined}
          helperText={nameErrorText}
          onChange={nameField.onChange}
          onBlur={nameField.onBlur}
          inputRef={nameField.ref}
        />
        <KkTextField
          name={streetField.name}
          label={STREET_LABEL}
          required
          autoComplete="street-address"
          error={streetErrorText !== undefined}
          helperText={streetErrorText}
          onChange={streetField.onChange}
          onBlur={streetField.onBlur}
          inputRef={streetField.ref}
        />
        <Grid container spacing={GRID_SPACING} sx={{ minWidth: 0 }}>
          <Grid size={ZIP_SIZE} sx={{ minWidth: 0 }}>
            <KkTextField
              name={zipField.name}
              label={ZIP_LABEL}
              required
              inputMode="numeric"
              autoComplete="postal-code"
              error={zipErrorText !== undefined}
              helperText={zipErrorText}
              onChange={zipField.onChange}
              onBlur={zipField.onBlur}
              inputRef={zipField.ref}
            />
          </Grid>
          <Grid size={CITY_SIZE} sx={{ minWidth: 0 }}>
            <KkTextField
              name={cityField.name}
              label={CITY_LABEL}
              required
              autoComplete="address-level2"
              error={cityErrorText !== undefined}
              helperText={cityErrorText}
              onChange={cityField.onChange}
              onBlur={cityField.onBlur}
              inputRef={cityField.ref}
            />
          </Grid>
        </Grid>
        <KkTextArea
          name="hint"
          label={HINT_LABEL}
          value={control.hint}
          onChange={control.setHint}
          onBlur={control.touchHint}
          rows={HINT_ROWS}
          maxLength={VENUE_HINT_MAX_LENGTH}
          showCount
          countLabel={toCountLabel}
          placeholder={HINT_PLACEHOLDER}
          hint={HINT_HINT}
          error={hintErrorText !== undefined}
          helperText={hintErrorText}
        />
      </Stack>
    </WriteScreen>
  );
};
