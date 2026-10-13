import type { KkNumberStepLabels } from '@furria/ui';
import {
  KkConfirmDialog,
  KkFormPair,
  KkFormSection,
  KkNote,
  KkNumberField,
  KkSessionField,
  KkTextField,
  KkWriteScreen,
} from '@furria/ui';
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

const SESSION_SECTION_TITLE = 'Session';
const MOTTO_SECTION_TITLE = 'Motto & Logo';
const SEASON_LABEL = 'Session';
const NUMBER_LABEL = 'Sessionsnummer';
const NUMBER_HINT = 'Leer lassen, wenn unbekannt.';
const NUMBER_MIN = 1;
const NUMBER_STEP_LABELS: KkNumberStepLabels = {
  less: 'Eine Nummer niedriger',
  more: 'Eine Nummer höher',
};
const MOTTO_LABEL = 'Motto';
const MOTTO_HINT = 'Im originalen Wortlaut, erscheint auf der Website.';
const CREATE_NOTE =
  'Nur das Jahr ist Pflicht. Sessionsnummer, Motto und Sessionslogo nur eintragen, wenn sie belegt sind.';

interface SessionEditorProps {
  record: SessionRecordSummary | null;
  draftYear?: number | null;
}

export const SessionEditor: FC<SessionEditorProps> = ({ record, draftYear = null }) => {
  const control = useSessionEditor(record, draftYear);
  const removal = useSessionRemoval(record);
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
        primary: {
          label: actionLabel,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      {intro}
      <KkFormSection title={SESSION_SECTION_TITLE}>
        <KkFormPair
          balance="leading"
          start={
            <KkSessionField
              name="startYear"
              label={SEASON_LABEL}
              value={control.startYear}
              onChange={control.setStartYear}
              currentSessionYear={control.currentSessionYear}
              required
              error={startYearErrorText !== undefined}
              helperText={startYearErrorText}
            />
          }
          end={
            <KkNumberField
              name="number"
              label={NUMBER_LABEL}
              value={control.number}
              onChange={control.setNumber}
              stepLabels={NUMBER_STEP_LABELS}
              min={NUMBER_MIN}
              hint={NUMBER_HINT}
              error={numberErrorText !== undefined}
              helperText={numberErrorText}
            />
          }
        />
      </KkFormSection>
      <KkFormSection title={MOTTO_SECTION_TITLE}>
        <KkTextField
          name={mottoField.name}
          label={MOTTO_LABEL}
          hint={MOTTO_HINT}
          error={mottoErrorText !== undefined}
          helperText={mottoErrorText}
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
      </KkFormSection>
      {danger}
      {confirm}
    </WriteScreen>
  );
};
