import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { WriteScreen } from '@/features/write/WriteScreen';
import { useGroupKindEditor } from '../hooks/use-group-kind-editor';
import { GROUPS_HELP_SPOTS } from '../manage-groups-help-copy';
import type { GroupKindEntry } from '../manage-groups-labels';
import { toGroupKindEditorOrigin } from '../manage-groups-labels';
import { GroupKindEditorHelp } from './GroupKindEditorHelp';

const CREATE_TITLE = 'Gruppenart hinzufügen';
const EDIT_TITLE = 'Gruppenart bearbeiten';
const ADD_LABEL = 'Hinzufügen';
const SAVE_LABEL = 'Speichern';
const SECTION_TITLE = 'Gruppenart';
const NAME_LABEL = 'Name';

interface GroupKindEditorProps {
  entry: GroupKindEntry | null;
}

export const GroupKindEditor: FC<GroupKindEditorProps> = ({ entry }) => {
  const control = useGroupKindEditor(entry);
  const nameField = control.form.register('name');
  const help = toScreenHelp(<GroupKindEditorHelp isEditing={entry !== null} />);
  const nameErrorText = control.form.formState.errors.name?.message;

  const title = entry === null ? CREATE_TITLE : EDIT_TITLE;
  const actionLabel = entry === null ? ADD_LABEL : SAVE_LABEL;

  return (
    <WriteScreen
      origin={toGroupKindEditorOrigin(entry)}
      title={title}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      help={help}
      action={{
        primary: {
          label: actionLabel,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      <KkFormSection title={SECTION_TITLE} landing={GROUPS_HELP_SPOTS.kindForm}>
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
      </KkFormSection>
    </WriteScreen>
  );
};
