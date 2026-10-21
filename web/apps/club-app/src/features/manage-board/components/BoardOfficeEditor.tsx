import type { KkNumberStepLabels } from '@furria/ui';
import {
  KkButton,
  KkFieldRow,
  KkFormPair,
  KkFormSection,
  KkNote,
  KkNumberField,
  KkSelectField,
  KkTextField,
} from '@furria/ui';
import type { FC } from 'react';
import { ClubIconField, WriteScreen } from '@/features/write';
import type { EditorReturn } from '../board-hub';
import { useBoardOfficeEditor } from '../hooks/use-board-office-editor';
import type { BoardOfficeEntry } from '../manage-board-labels';
import {
  BOARD_ORIGIN,
  IMPLIED_ROLE_LABEL,
  IMPLIED_ROLE_READ_ONLY_HINT,
  toOfficeOrigin,
} from '../manage-board-labels';

const CREATE_TITLE = 'Vorstandsfunktion hinzufügen';
const EDIT_TITLE = 'Vorstandsfunktion bearbeiten';
const CREATE_EXPLANATION = 'Die Besetzung trägst du im Anschluss ein.';
const EDIT_EXPLANATION = 'Bestehende Sitze bleiben von Änderungen unberührt.';
const OFFICE_SECTION = 'Funktion';
const ROLE_SECTION = 'Rolle';
const NAME_LABEL = 'Name';
const NAME_HINT = 'Erscheint so im Vorstand auf der Website und in der App.';
const SORT_ORDER_LABEL = 'Platz im Vorstand';
const SORT_ORDER_HINT = 'Kleinere Zahlen stehen weiter oben.';
const SORT_ORDER_MIN = 1;
const SORT_ORDER_MAX = 999;
const SORT_ORDER_STEPS: KkNumberStepLabels = {
  less: 'Einen Platz höher',
  more: 'Einen Platz tiefer',
};
const IMPLIED_ROLE_HINT = 'Wer den Sitz innehat, bekommt diese Rolle samt ihren Rechten.';
const CREATE_ACTION_LABEL = 'Hinzufügen';
const EDIT_ACTION_LABEL = 'Speichern';
const RETRY_ROLES_LABEL = 'Rollen erneut laden';

interface BoardOfficeEditorProps {
  entry: BoardOfficeEntry | null;
  returnTo: EditorReturn;
}

export const BoardOfficeEditor: FC<BoardOfficeEditorProps> = ({ entry, returnTo }) => {
  const control = useBoardOfficeEditor(entry, returnTo);
  const { errors } = control.form.formState;

  const title = entry === null ? CREATE_TITLE : EDIT_TITLE;
  const explanation = entry === null ? CREATE_EXPLANATION : EDIT_EXPLANATION;
  const actionLabel = entry === null ? CREATE_ACTION_LABEL : EDIT_ACTION_LABEL;
  const origin = entry === null ? BOARD_ORIGIN : toOfficeOrigin(entry, returnTo);

  const nameField = control.form.register('name');

  const impliedRoleError = control.impliedRoleChoicesError ?? undefined;

  const impliedRoleControl = control.canChangeRole ? (
    <KkSelectField
      name="impliedRole"
      label={IMPLIED_ROLE_LABEL}
      value={control.impliedRoleValue}
      options={control.impliedRoleChoices}
      onChange={control.setImpliedRoleValue}
      presentation="select"
      hint={IMPLIED_ROLE_HINT}
      disabled={control.impliedRoleChoicesPending}
      error={impliedRoleError !== undefined}
      helperText={impliedRoleError}
    />
  ) : (
    <KkFieldRow
      label={IMPLIED_ROLE_LABEL}
      value={control.impliedRoleStatement}
      hint={IMPLIED_ROLE_READ_ONLY_HINT}
    />
  );
  const impliedRoleRetry =
    impliedRoleError === undefined ? null : (
      <KkButton
        size="small"
        variant="outlined"
        onClick={control.retryImpliedRoleChoices}
        loading={control.impliedRoleChoicesRetrying}
      >
        {RETRY_ROLES_LABEL}
      </KkButton>
    );
  const roleSection =
    entry === null ? null : (
      <KkFormSection title={ROLE_SECTION}>
        {impliedRoleControl}
        {impliedRoleRetry}
      </KkFormSection>
    );

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
      <KkNote>{explanation}</KkNote>
      <KkFormSection title={OFFICE_SECTION}>
        <KkFormPair
          balance="leading"
          start={
            <KkTextField
              name={nameField.name}
              label={NAME_LABEL}
              required
              hint={NAME_HINT}
              inputRef={nameField.ref}
              onChange={nameField.onChange}
              onBlur={nameField.onBlur}
              error={errors.name !== undefined}
              helperText={errors.name?.message}
            />
          }
          end={
            <KkNumberField
              name="sortOrder"
              label={SORT_ORDER_LABEL}
              required
              value={control.sortOrder}
              onChange={control.setSortOrder}
              min={SORT_ORDER_MIN}
              max={SORT_ORDER_MAX}
              stepLabels={SORT_ORDER_STEPS}
              hint={SORT_ORDER_HINT}
              error={errors.sortOrder !== undefined}
              helperText={errors.sortOrder?.message}
            />
          }
        />
        <ClubIconField value={control.icon} onChange={control.setIcon} />
      </KkFormSection>
      {roleSection}
    </WriteScreen>
  );
};
