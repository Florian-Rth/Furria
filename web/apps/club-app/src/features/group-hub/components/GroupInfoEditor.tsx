import type { KkNumberStepLabels } from '@furria/ui';
import { KkFormPair, KkFormSection, KkNumberField, KkSelectField, KkTextArea } from '@furria/ui';
import type { FC } from 'react';
import {
  GROUP_KIND_FIELD_HINT,
  GROUP_KIND_FIELD_LABEL,
  toGroupKindOptions,
  toHeldGroupKind,
  useGroupKindsQuery,
} from '@/features/group-kinds';
import { toGroupTone } from '@/features/groups';
import { WriteScreen } from '@/features/write';
import { toHubEditorOrigin } from '../group-hub-labels';
import { toEditorChoicesErrorMessage } from '../group-hub-messages';
import { useGroupInfoEditor } from '../hooks/use-group-info-editor';
import { useTakenTones } from '../hooks/use-taken-tones';
import type { GroupHub } from '../schemas';
import { DESCRIPTION_MAX_LENGTH, EARLIEST_FOUNDED_YEAR, LATEST_FOUNDED_YEAR } from '../schemas';
import { GroupEditorError } from './GroupEditorError';
import { GroupEditorSkeleton } from './GroupEditorSkeleton';
import { GroupPictureSection } from './GroupPictureSection';
import { HubTonePicker } from './HubTonePicker';

const TITLE = 'Angaben zur Gruppe bearbeiten';
const SAVE_LABEL = 'Speichern';
const ABOUT_SECTION = 'Über die Gruppe';
const FACTS_SECTION = 'Eckdaten';
const DESCRIPTION_LABEL = 'Beschreibung';
const DESCRIPTION_PLACEHOLDER = 'Kurzbeschreibung der Gruppe';
const DESCRIPTION_HINT =
  'Erscheint auf der Gruppenseite und in der Vorschau im Gruppenverzeichnis.';
const DESCRIPTION_ROWS = 5;
const FOUNDED_LABEL = 'Gründungsjahr';
const FOUNDED_HINT = 'Nur die Jahreszahl. Die App hebt Jubiläen hervor.';
const FOUNDED_STEP_LABELS: KkNumberStepLabels = {
  less: 'Ein Jahr früher',
  more: 'Ein Jahr später',
};
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
        isRetrying={kinds.isFetching}
      />
    );
  }
  if (takenTones.state.kind === 'failed') {
    const tonesErrorMessage = toEditorChoicesErrorMessage(takenTones.state.error);

    return (
      <GroupEditorError
        title={TITLE}
        origin={origin}
        message={tonesErrorMessage}
        onRetry={takenTones.retry}
        isRetrying={takenTones.isRetrying}
      />
    );
  }
  if (takenTones.state.kind === 'pending') {
    return <GroupEditorSkeleton />;
  }

  const kindOptions = toGroupKindOptions(kinds.data.kinds, heldKind);
  const pictureTone = toGroupTone(hub.groupId, control.tone === '' ? null : control.tone);

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
      <KkFormSection title={ABOUT_SECTION}>
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
      </KkFormSection>
      <GroupPictureSection hub={hub} tone={pictureTone} />
      <KkFormSection title={FACTS_SECTION} description={NAME_NOTE}>
        <KkFormPair
          balance="leading"
          start={
            <KkSelectField
              name="groupKindId"
              label={GROUP_KIND_FIELD_LABEL}
              value={control.groupKindId}
              options={kindOptions}
              onChange={control.setGroupKindId}
              presentation="select"
              hint={GROUP_KIND_FIELD_HINT}
            />
          }
          end={
            <KkNumberField
              name="foundedYear"
              label={FOUNDED_LABEL}
              value={control.foundedYear}
              onChange={control.setFoundedYear}
              stepLabels={FOUNDED_STEP_LABELS}
              min={EARLIEST_FOUNDED_YEAR}
              max={LATEST_FOUNDED_YEAR}
              hint={FOUNDED_HINT}
              error={control.foundedYearError !== undefined}
              helperText={control.foundedYearError}
            />
          }
        />
        <HubTonePicker
          value={control.tone}
          takenTones={takenTones.state.tones}
          onChange={control.setTone}
        />
      </KkFormSection>
    </WriteScreen>
  );
};
