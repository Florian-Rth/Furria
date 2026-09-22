import { KkNote, KkTextField } from '@furria/ui';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import { useGroupKindEditor } from '../hooks/use-group-kind-editor';
import type { GroupKindEntry } from '../manage-groups-labels';
import { toGroupKindEditorOrigin } from '../manage-groups-labels';

const CREATE_TITLE = 'Gruppenart hinzufügen';
const EDIT_TITLE = 'Gruppenart bearbeiten';
const ADD_LABEL = 'Hinzufügen';
const SAVE_LABEL = 'Speichern';
const NAME_LABEL = 'Name';
const CREATE_EXPLANATION =
  'Eine Gruppenart ordnet Gruppen ein — Garde, Elferrat, Spielmannszug. Welche Gruppe welche Art trägt, legst du danach an der Gruppe fest.';
const EDIT_EXPLANATION =
  'Der Name steht so im Verzeichnis. Die Gruppen, die diese Art tragen, behalten sie — auch nach einer Umbenennung.';

interface GroupKindEditorProps {
  entry: GroupKindEntry | null;
}

export const GroupKindEditor: FC<GroupKindEditorProps> = ({ entry }) => {
  const control = useGroupKindEditor(entry);
  const nameField = control.form.register('name');
  const nameErrorText = control.form.formState.errors.name?.message;

  const title = entry === null ? CREATE_TITLE : EDIT_TITLE;
  const explanation = entry === null ? CREATE_EXPLANATION : EDIT_EXPLANATION;
  const actionLabel = entry === null ? ADD_LABEL : SAVE_LABEL;

  return (
    <WriteScreen
      origin={toGroupKindEditorOrigin(entry)}
      title={title}
      rejection={control.rejection ?? undefined}
      isDirty={control.form.formState.isDirty}
      action={{
        primary: { label: actionLabel, onSelect: control.submit, loading: control.isSaving },
      }}
    >
      <KkTextField
        name={nameField.name}
        label={NAME_LABEL}
        error={nameErrorText !== undefined}
        helperText={nameErrorText}
        onChange={nameField.onChange}
        onBlur={nameField.onBlur}
        inputRef={nameField.ref}
      />
      <KkNote>{explanation}</KkNote>
    </WriteScreen>
  );
};
