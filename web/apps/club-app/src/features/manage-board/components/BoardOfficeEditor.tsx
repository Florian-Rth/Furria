import { KkFieldRow, KkNote, KkSelectField, KkTextField } from '@furria/ui';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
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
const CREATE_EXPLANATION =
  'Eine Vorstandsfunktion ist ein Posten im Vorstand — Präsident, Kassenwart, Beisitzer. Wer darin sitzt, trägst du danach ein.';
const EDIT_EXPLANATION =
  'Name und Platz stehen so im Vorstand. Die Sitze bleiben, wie sie sind — auch nach einer Änderung.';
const NAME_LABEL = 'Name';
const SORT_ORDER_LABEL = 'Platz im Vorstand';
const SORT_ORDER_HINT =
  'Kleinere Zahlen stehen weiter vorn. Der Platz bleibt über jede Wahl hinweg.';
const CREATE_ACTION_LABEL = 'Hinzufügen';
const EDIT_ACTION_LABEL = 'Speichern';

interface BoardOfficeEditorProps {
  entry: BoardOfficeEntry | null;
}

export const BoardOfficeEditor: FC<BoardOfficeEditorProps> = ({ entry }) => {
  const control = useBoardOfficeEditor(entry);
  const { errors } = control.form.formState;

  const title = entry === null ? CREATE_TITLE : EDIT_TITLE;
  const explanation = entry === null ? CREATE_EXPLANATION : EDIT_EXPLANATION;
  const actionLabel = entry === null ? CREATE_ACTION_LABEL : EDIT_ACTION_LABEL;
  const origin = entry === null ? BOARD_ORIGIN : toOfficeOrigin(entry);

  const nameField = control.form.register('name');
  const sortOrderField = control.form.register('sortOrder');

  const impliedRoleControl = control.canChangeRole ? (
    <KkSelectField
      name="impliedRole"
      label={IMPLIED_ROLE_LABEL}
      value={control.impliedRoleValue}
      options={control.impliedRoleChoices}
      onChange={control.setImpliedRoleValue}
      presentation="select"
    />
  ) : (
    <KkFieldRow
      label={IMPLIED_ROLE_LABEL}
      value={control.impliedRoleStatement}
      hint={IMPLIED_ROLE_READ_ONLY_HINT}
    />
  );
  const impliedRoleField = entry === null ? null : impliedRoleControl;

  return (
    <WriteScreen
      origin={origin}
      title={title}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: { label: actionLabel, onSelect: control.submit, loading: control.isSaving },
      }}
    >
      <KkNote>{explanation}</KkNote>
      <KkTextField
        name={nameField.name}
        label={NAME_LABEL}
        inputRef={nameField.ref}
        onChange={nameField.onChange}
        onBlur={nameField.onBlur}
        error={errors.name !== undefined}
        helperText={errors.name?.message}
      />
      <KkTextField
        name={sortOrderField.name}
        label={SORT_ORDER_LABEL}
        inputMode="numeric"
        inputRef={sortOrderField.ref}
        onChange={sortOrderField.onChange}
        onBlur={sortOrderField.onBlur}
        error={errors.sortOrder !== undefined}
        helperText={errors.sortOrder?.message ?? SORT_ORDER_HINT}
      />
      {impliedRoleField}
    </WriteScreen>
  );
};
