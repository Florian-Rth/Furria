import { KkSelectField, KkTextField } from '@furria/ui';
import type { ChangeEvent, FC } from 'react';
import {
  GROUP_KIND_FIELD_HINT,
  GROUP_KIND_FIELD_LABEL,
  toGroupKindOptions,
  toHeldGroupKind,
  useGroupKindsQuery,
} from '@/features/group-kinds';
import { WriteScreen } from '@/features/write';
import { toHubEditorOrigin } from '../group-hub-labels';
import { useGroupAdministrationEditor } from '../hooks/use-group-administration-editor';
import type { GroupHub } from '../schemas';

const TITLE = 'Name und Gruppenart bearbeiten';
const SAVE_LABEL = 'Speichern';
const NAME_LABEL = 'Name';

interface GroupAdministrationEditorProps {
  hub: GroupHub;
}

export const GroupAdministrationEditor: FC<GroupAdministrationEditorProps> = ({ hub }) => {
  const control = useGroupAdministrationEditor(hub);
  const kinds = useGroupKindsQuery();
  const heldKind = toHeldGroupKind(hub.groupKindId, hub.groupKindName);
  const kindOptions = toGroupKindOptions(kinds.data?.kinds ?? [], heldKind);

  const changeName = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    control.setName(event.target.value);
  };

  return (
    <WriteScreen
      origin={toHubEditorOrigin(hub)}
      title={TITLE}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: { label: SAVE_LABEL, onSelect: control.submit, loading: control.isSaving },
      }}
    >
      <KkTextField
        name="name"
        label={NAME_LABEL}
        value={control.name}
        onChange={changeName}
        error={control.nameError !== null}
        helperText={control.nameError ?? undefined}
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
    </WriteScreen>
  );
};
