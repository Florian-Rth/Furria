import { KkNote, KkSelectField, KkTextArea, KkTextField } from '@furria/ui';
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
import { useGroupInfoEditor } from '../hooks/use-group-info-editor';
import { useTakenTones } from '../hooks/use-taken-tones';
import type { GroupHub } from '../schemas';
import { DESCRIPTION_MAX_LENGTH } from '../schemas';
import { HubTonePicker } from './HubTonePicker';

const TITLE = 'Angaben zur Gruppe bearbeiten';
const SAVE_LABEL = 'Speichern';
const DESCRIPTION_LABEL = 'Über die Gruppe';
const DESCRIPTION_PLACEHOLDER = 'Was macht die Gruppe, wann trefft ihr euch?';
const DESCRIPTION_HINT = 'Ein paar Sätze über die Gruppe. Der Text steht so im Verzeichnis.';
const DESCRIPTION_ROWS = 5;
const FOUNDED_LABEL = 'Gründungsjahr';
const FOUNDED_HINT =
  'Nur das Jahr, zwischen 1800 und 2100. Alle fünf Jahre feiert die App das Jubiläum mit.';
const NAME_NOTE = 'Den Namen der Gruppe ändert die Gruppenverwaltung.';

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface GroupInfoEditorProps {
  hub: GroupHub;
}

export const GroupInfoEditor: FC<GroupInfoEditorProps> = ({ hub }) => {
  const control = useGroupInfoEditor(hub);
  const kinds = useGroupKindsQuery();
  const takenTones = useTakenTones(hub.groupId, true);
  const heldKind = toHeldGroupKind(hub.groupKindId, hub.groupKindName);
  const kindOptions = toGroupKindOptions(kinds.data?.kinds ?? [], heldKind);

  const changeFoundedYear = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    control.setFoundedYear(event.target.value);
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
        name="foundedYear"
        label={FOUNDED_LABEL}
        inputMode="numeric"
        value={control.foundedYear}
        onChange={changeFoundedYear}
        error={control.foundedYearError !== null}
        helperText={control.foundedYearError ?? FOUNDED_HINT}
      />
      <HubTonePicker value={control.tone} takenTones={takenTones} onChange={control.setTone} />
      <KkNote>{NAME_NOTE}</KkNote>
    </WriteScreen>
  );
};
