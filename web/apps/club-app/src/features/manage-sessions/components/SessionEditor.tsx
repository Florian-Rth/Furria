import { KkConfirmDialog, KkNote, KkSessionField, KkTextField, KkWriteScreen } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import { useSessionEditor } from '../hooks/use-session-editor';
import { useSessionRemoval } from '../hooks/use-session-removal';
import {
  DELETE_EXPLANATION,
  DELETE_EYEBROW,
  LOGO_FIELD_LABEL,
  SESSIONS_ORIGIN,
  toDeleteConsequence,
  toDeleteQuestion,
  toSessionFacts,
  toSessionLogoLabel,
  toSessionSeasonLabel,
} from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';
import { SessionLogoField } from './SessionLogoField';

const CREATE_TITLE = 'Session hinzufügen';
const EDIT_TITLE = 'Sessionseintrag bearbeiten';
const ADD_LABEL = 'Hinzufügen';
const SAVE_LABEL = 'Speichern';
const DELETE_LABEL = 'Sessionseintrag löschen';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

const SEASON_LABEL = 'Session';
const NUMBER_LABEL = 'Nº';
const NUMBER_HINT = 'Steht auf dem Orden oder in der Festschrift. Leer lassen, wenn unbekannt.';
const MOTTO_LABEL = 'Motto';
const MOTTO_HINT = 'Der Ruf der Session, so wie er ausgerufen wurde.';
const CREATE_NOTE =
  'Das Jahr genügt. Nº, Motto und Sessionslogo kommen dazu, sobald der Verein sie belegen kann — abgeleitet wird nichts.';

const FIELD_GAP = 2.25;

interface SessionEditorProps {
  record: SessionRecordSummary | null;
}

export const SessionEditor: FC<SessionEditorProps> = ({ record }) => {
  const control = useSessionEditor(record);
  const removal = useSessionRemoval(record);
  const numberField = control.form.register('number');
  const mottoField = control.form.register('motto');
  const errors = control.form.formState.errors;

  const startYearErrorText = errors.startYear?.message;
  const numberErrorText = errors.number?.message;
  const mottoErrorText = errors.motto?.message;

  const isEditing = record !== null;
  const title = isEditing ? EDIT_TITLE : CREATE_TITLE;
  const actionLabel = isEditing ? SAVE_LABEL : ADD_LABEL;
  const intro = isEditing ? null : <KkNote>{CREATE_NOTE}</KkNote>;
  const logoLabel =
    control.startYear === null
      ? LOGO_FIELD_LABEL
      : toSessionLogoLabel(toSessionSeasonLabel(control.startYear));

  const danger =
    record === null ? null : <KkWriteScreen.Danger label={DELETE_LABEL} onSelect={removal.open} />;

  const confirm =
    record === null ? null : (
      <KkConfirmDialog
        open={removal.isOpen}
        onClose={removal.close}
        onConfirm={removal.submit}
        tone="danger"
        eyebrow={DELETE_EYEBROW}
        question={toDeleteQuestion(record)}
        explanation={DELETE_EXPLANATION}
        facts={toSessionFacts(record)}
        consequence={toDeleteConsequence(record)}
        error={removal.rejection ?? undefined}
        confirmLabel={DELETE_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={removal.isSaving}
      />
    );

  return (
    <WriteScreen
      origin={SESSIONS_ORIGIN}
      title={title}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: { label: actionLabel, onSelect: control.submit, loading: control.isSaving },
      }}
    >
      {intro}
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
      {danger}
      {confirm}
    </WriteScreen>
  );
};
