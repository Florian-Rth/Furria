import { KkNote, KkSelectField, KkTextField } from '@furria/ui';
import type { FC } from 'react';
import type { RunningGroupKind } from '@/features/group-kinds';
import {
  GROUP_KIND_FIELD_HINT,
  GROUP_KIND_FIELD_LABEL,
  toGroupKindOptions,
} from '@/features/group-kinds';
import { WriteScreen } from '@/features/write';
import { useGroupCreateEditor } from '../hooks/use-group-create-editor';
import { MANAGE_GROUPS_ORIGIN } from '../manage-groups-labels';

const TITLE = 'Gruppe hinzufügen';
const ADD_LABEL = 'Hinzufügen';
const NAME_LABEL = 'Name der Gruppe';
const CREATE_NOTE =
  'Die Gruppe erscheint sofort im Verzeichnis. Beschreibung, Farbe und Trainingszeiten pflegen anschließend die Gruppen-Admins.';

interface GroupCreateEditorProps {
  kinds: readonly RunningGroupKind[];
}

export const GroupCreateEditor: FC<GroupCreateEditorProps> = ({ kinds }) => {
  const control = useGroupCreateEditor();
  const kindOptions = toGroupKindOptions(kinds, null);
  const nameField = control.form.register('name');
  const nameErrorText = control.form.formState.errors.name?.message;

  return (
    <WriteScreen
      origin={MANAGE_GROUPS_ORIGIN}
      title={TITLE}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: {
          label: ADD_LABEL,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
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
      <KkSelectField
        name="groupKindId"
        label={GROUP_KIND_FIELD_LABEL}
        value={control.groupKindId}
        options={kindOptions}
        onChange={control.setGroupKindId}
        presentation="select"
        hint={GROUP_KIND_FIELD_HINT}
      />
      <KkNote>{CREATE_NOTE}</KkNote>
    </WriteScreen>
  );
};
