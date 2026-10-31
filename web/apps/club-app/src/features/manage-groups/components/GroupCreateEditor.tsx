import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import {
  GROUP_KIND_FIELD_HINT,
  GROUP_KIND_FIELD_LABEL,
  toGroupKindOptions,
} from '@/features/group-kinds/group-kinds-labels';
import type { RunningGroupKind } from '@/features/group-kinds/schemas';
import { ClubIconField } from '@/features/write/components/ClubIconField';
import { WriteScreen } from '@/features/write/WriteScreen';
import { useGroupCreateEditor } from '../hooks/use-group-create-editor';
import { MANAGE_GROUPS_ORIGIN } from '../manage-groups-labels';

const TITLE = 'Gruppe hinzufügen';
const ADD_LABEL = 'Hinzufügen';
const SECTION_TITLE = 'Gruppe';
const NAME_LABEL = 'Name der Gruppe';
const NAME_HINT = 'Erscheint im Gruppenverzeichnis, auf der Gruppenseite und im Kalender.';

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
      <KkFormSection title={SECTION_TITLE}>
        <KkTextField
          name={nameField.name}
          label={NAME_LABEL}
          required
          hint={NAME_HINT}
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
        <ClubIconField value={control.icon} onChange={control.setIcon} />
      </KkFormSection>
    </WriteScreen>
  );
};
