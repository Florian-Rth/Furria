import { KkAlert, KkButton, KkModalFrame, KkNote, KkSessionField, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useId } from 'react';
import { useSessionRecordForm } from '../hooks/use-session-record-form';
import {
  LOGO_FIELD_LABEL,
  MANAGE_SESSIONS_TITLE,
  toSessionLogoLabel,
  toSessionSeasonLabel,
} from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';
import { SessionLogoField } from './SessionLogoField';

const CREATE_TITLE = 'Session eintragen';
const EDIT_TITLE = 'Sessionseintrag bearbeiten';
const CREATE_CONFIRM = 'Eintragen';
const EDIT_CONFIRM = 'Speichern';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';

const SEASON_LABEL = 'Session';
const NUMBER_LABEL = 'Nº';
const NUMBER_HINT = 'Steht auf dem Orden oder in der Festschrift. Leer lassen, wenn unbekannt.';
const MOTTO_LABEL = 'Motto';
const MOTTO_HINT = 'Der Ruf der Session, so wie er ausgerufen wurde.';
const CREATE_NOTE =
  'Das Jahr genügt. Nº, Motto und Sessionslogo kommen dazu, sobald der Verein sie belegen kann — abgeleitet wird nichts.';

const FIELD_GAP = 2.25;

interface SessionRecordFormDialogProps {
  record: SessionRecordSummary | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SessionRecordFormDialog: FC<SessionRecordFormDialogProps> = ({
  record,
  open,
  onClose,
  onSaved,
}) => {
  const titleId = useId();
  const control = useSessionRecordForm({ record, open, onSaved });
  const numberField = control.form.register('number');
  const mottoField = control.form.register('motto');
  const errors = control.form.formState.errors;

  const startYearErrorText = errors.startYear?.message;
  const numberErrorText = errors.number?.message;
  const mottoErrorText = errors.motto?.message;

  const title = control.isEditing ? EDIT_TITLE : CREATE_TITLE;
  const confirmLabel = control.isEditing ? EDIT_CONFIRM : CREATE_CONFIRM;
  const kicker = record === null ? MANAGE_SESSIONS_TITLE : toSessionSeasonLabel(record.startYear);
  const logoLabel =
    control.startYear === null
      ? LOGO_FIELD_LABEL
      : toSessionLogoLabel(toSessionSeasonLabel(control.startYear));

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
          <KkSessionField
            name="startYear"
            label={SEASON_LABEL}
            value={control.startYear}
            onChange={control.setStartYear}
            currentSessionYear={control.currentSessionYear}
            error={startYearErrorText !== undefined}
            helperText={startYearErrorText}
          />
          <KkTextField
            name={numberField.name}
            label={NUMBER_LABEL}
            inputMode="numeric"
            error={numberErrorText !== undefined}
            helperText={numberErrorText ?? NUMBER_HINT}
            onChange={numberField.onChange}
            onBlur={numberField.onBlur}
            inputRef={numberField.ref}
          />
          <KkTextField
            name={mottoField.name}
            label={MOTTO_LABEL}
            error={mottoErrorText !== undefined}
            helperText={mottoErrorText ?? MOTTO_HINT}
            onChange={mottoField.onChange}
            onBlur={mottoField.onBlur}
            inputRef={mottoField.ref}
          />
          <SessionLogoField
            logoSvg={control.logoSvg}
            label={logoLabel}
            rejection={control.logoRejection}
            onPick={control.takeLogoFile}
            onClear={control.clearLogo}
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
