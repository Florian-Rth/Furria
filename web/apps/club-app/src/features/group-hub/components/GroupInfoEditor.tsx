import { KkNote, KkSelectField, KkTextArea, KkTextField } from '@furria/ui';
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
import { useGroupInfoEditor } from '../hooks/use-group-info-editor';
import { useTakenTones } from '../hooks/use-taken-tones';
import type { GroupHub } from '../schemas';
import { DESCRIPTION_MAX_LENGTH } from '../schemas';
import { GroupEditorError } from './GroupEditorError';
import { GroupEditorSkeleton } from './GroupEditorSkeleton';
import { HubTonePicker } from './HubTonePicker';

const TITLE = 'Angaben zur Gruppe bearbeiten';
const SAVE_LABEL = 'Speichern';
const DESCRIPTION_LABEL = 'Über die Gruppe';
const DESCRIPTION_PLACEHOLDER = 'Kurzbeschreibung der Gruppe';
const DESCRIPTION_HINT = 'Erscheint so im Gruppenverzeichnis.';
const DESCRIPTION_ROWS = 5;
const FOUNDED_LABEL = 'Gründungsjahr';
const FOUNDED_HINT = 'Nur die Jahreszahl. Die App hebt Jubiläen hervor.';
const NAME_NOTE = 'Der Name wird in der Gruppenverwaltung geändert.';

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface GroupInfoEditorProps {
  hub: GroupHub;
}

export const GroupInfoEditor: FC<GroupInfoEditorProps> = ({ hub }) => {
  const control = useGroupInfoEditor(hub);
  const kinds = useGroupKindsQuery();
  const takenTones = useTakenTones(hub.groupId, true);
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
  if (takenTones === null) {
    return <GroupEditorSkeleton />;
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
      <KkTextArea
        name="description"
        label={DESCRIPTION_LABEL}
        value={control.description}
        onChange={control.setDescription}
        rows={DESCRIPTION_ROWS}
        maxLength={DESCRIPTION_MAX_LENGTH}
        showCount
        countLabel={toCountLabel}
        placeholder={DESCRIPTION_PLACEHOLDER}
        hint={DESCRIPTION_HINT}
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
      <KkTextField
        name={control.foundedYear.name}
        label={FOUNDED_LABEL}
        inputMode="numeric"
        onChange={control.foundedYear.onChange}
        onBlur={control.foundedYear.onBlur}
        inputRef={control.foundedYear.ref}
        error={control.foundedYearError !== undefined}
        helperText={control.foundedYearError ?? FOUNDED_HINT}
      />
      <HubTonePicker value={control.tone} takenTones={takenTones} onChange={control.setTone} />
      <KkNote>{NAME_NOTE}</KkNote>
    </WriteScreen>
  );
};
