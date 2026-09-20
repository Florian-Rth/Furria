import { KkAlert, KkButton, KkModalFrame, KkNote, KkTextArea, KkTextField } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useId } from 'react';
import { useVenueForm } from '../hooks/use-venue-form';
import type { ManagedVenue } from '../schemas';
import { VENUE_HINT_MAX_LENGTH } from '../schemas';

const CREATE_TITLE = 'Ort eintragen';
const EDIT_TITLE = 'Ort bearbeiten';
const CREATE_KICKER = 'Orte';
const CREATE_CONFIRM = 'Eintragen';
const EDIT_CONFIRM = 'Speichern';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';

const NAME_LABEL = 'Name des Ortes';
const STREET_LABEL = 'Straße und Hausnummer';
const ZIP_LABEL = 'PLZ';
const CITY_LABEL = 'Stadt';
const HINT_LABEL = 'Hinweis';
const HINT_PLACEHOLDER = 'Zugang über den Hof';
const HINT_HINT = 'Was die Anschrift nicht sagt. Bleibt leer, wenn es nichts zu sagen gibt.';
const HINT_ROWS = 3;
const CREATE_NOTE =
  'Die Anschrift wird einmal hier geschrieben und überall gelesen — im Kalender, bei den Schlüsseln und später auf der Website.';

const FIELD_GAP = 2.25;
const ZIP_SIZE = { xs: 4, sm: 3 };
const CITY_SIZE = { xs: 8, sm: 9 };
const GRID_SPACING = 2;

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface VenueFormDialogProps {
  venue: ManagedVenue | null;
  open: boolean;
  onClose: () => void;
  onSaved: (venueId: number) => void;
}

export const VenueFormDialog: FC<VenueFormDialogProps> = ({ venue, open, onClose, onSaved }) => {
  const titleId = useId();
  const control = useVenueForm({ venue, open, onSaved });
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

  const title = control.isEditing ? EDIT_TITLE : CREATE_TITLE;
  const kicker = venue === null ? CREATE_KICKER : venue.name;
  const confirmLabel = control.isEditing ? EDIT_CONFIRM : CREATE_CONFIRM;

  const intro = control.isEditing ? null : <KkNote>{CREATE_NOTE}</KkNote>;
  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;

  return (
    <KkModalFrame open={open} onClose={onClose} labelledBy={titleId} closeLabel={CLOSE_LABEL}>
      <KkModalFrame.Kicker>{kicker}</KkModalFrame.Kicker>
      <KkModalFrame.Title id={titleId}>{title}</KkModalFrame.Title>
      <KkModalFrame.Body>{intro}</KkModalFrame.Body>
      <KkModalFrame.Fields>
        <Stack sx={{ gap: FIELD_GAP, minWidth: 0 }}>
          <KkTextField
            name={nameField.name}
            label={NAME_LABEL}
            error={nameErrorText !== undefined}
            helperText={nameErrorText}
            onChange={nameField.onChange}
            onBlur={nameField.onBlur}
            inputRef={nameField.ref}
          />
          <KkTextField
            name={streetField.name}
            label={STREET_LABEL}
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
      </KkModalFrame.Fields>
      <KkModalFrame.Footer>
        {rejection}
        <KkButton variant="outlined" onClick={onClose} disabled={control.isSaving}>
          {CANCEL_LABEL}
        </KkButton>
        <KkButton onClick={control.submit} loading={control.isSaving}>
          {confirmLabel}
        </KkButton>
      </KkModalFrame.Footer>
    </KkModalFrame>
  );
};
