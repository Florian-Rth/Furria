import { KkFormSection, KkSelectField, KkTextField } from '@furria/ui';
import type { FC } from 'react';
import {
  GROUP_KIND_FIELD_HINT,
  GROUP_KIND_FIELD_LABEL,
  toGroupKindOptions,
  toHeldGroupKind,
  useGroupKindsQuery,
} from '@/features/group-kinds';
import { WriteScreen } from '@/features/write';
import { toHubEditorOrigin } from '../group-hub-labels';
import { toEditorChoicesErrorMessage } from '../group-hub-messages';
import { useGroupAdministrationEditor } from '../hooks/use-group-administration-editor';
import type { GroupHub } from '../schemas';
import { GroupEditorError } from './GroupEditorError';
import { GroupEditorSkeleton } from './GroupEditorSkeleton';

const TITLE = 'Name und Gruppenart bearbeiten';
const SAVE_LABEL = 'Speichern';
const SECTION_TITLE = 'Gruppe';
const NAME_LABEL = 'Name';
const NAME_HINT = 'Erscheint im Gruppenverzeichnis, auf der Gruppenseite und im Kalender.';

interface GroupAdministrationEditorProps {
  hub: GroupHub;
}

export const GroupAdministrationEditor: FC<GroupAdministrationEditorProps> = ({ hub }) => {
  const control = useGroupAdministrationEditor(hub);
  const kinds = useGroupKindsQuery();
  const heldKind = toHeldGroupKind(hub.groupKindId, hub.groupKindName);
  const origin = toHubEditorOrigin(hub);

  const reloadKinds = (): void => {
    void kinds.refetch();
  };

  if (kinds.data === undefined) {
    if (kinds.error === null) {
      return <GroupEditorSkeleton />;
    }

    const kindsErrorMessage = toEditorChoicesErrorMessage(kinds.error);

    return (
      <GroupEditorError
        title={TITLE}
        origin={origin}
        message={kindsErrorMessage}
        onRetry={reloadKinds}
      />
    );
  }

  const kindOptions = toGroupKindOptions(kinds.data.kinds, heldKind);

  return (
    <WriteScreen
      origin={origin}
      title={TITLE}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: {
          label: SAVE_LABEL,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      <KkFormSection title={SECTION_TITLE}>
        <KkTextField
          name={control.name.name}
          label={NAME_LABEL}
          required
          hint={NAME_HINT}
          onChange={control.name.onChange}
          onBlur={control.name.onBlur}
          inputRef={control.name.ref}
          error={control.nameError !== undefined}
          helperText={control.nameError}
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
      </KkFormSection>
    </WriteScreen>
  );
};
