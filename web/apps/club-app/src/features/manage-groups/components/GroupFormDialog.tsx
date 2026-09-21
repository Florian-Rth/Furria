import {
  KkAlert,
  KkButton,
  KkModalFrame,
  KkNote,
  KkSelectField,
  KkSwitchRow,
  KkTextArea,
  KkTextField,
} from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useId } from 'react';
import {
  GROUP_KIND_FIELD_HINT,
  GROUP_KIND_FIELD_LABEL,
  toGroupKindOptions,
  toHeldGroupKind,
  useGroupKindsQuery,
} from '@/features/group-kinds';
import { useGroupForm } from '../hooks/use-group-form';
import type { ManagedGroupSummary } from '../schemas';
import { GROUP_DESCRIPTION_MAX_LENGTH } from '../schemas';

const CREATE_TITLE = 'Gruppe anlegen';
const EDIT_TITLE = 'Gruppe bearbeiten';
const CREATE_KICKER = 'Gruppenverwaltung';
const CREATE_CONFIRM = 'Anlegen';
const EDIT_CONFIRM = 'Speichern';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';

const NAME_LABEL = 'Name der Gruppe';
const DESCRIPTION_LABEL = 'Über die Gruppe';
const DESCRIPTION_PLACEHOLDER = 'Was macht die Gruppe, wann trefft ihr euch?';
const DESCRIPTION_HINT = 'Ein paar Sätze über die Gruppe. Der Text steht so im Verzeichnis.';
const DESCRIPTION_ROWS = 5;
const OPENNESS_LABEL = 'Sucht Verstärkung';
const OPENNESS_DESCRIPTION = 'Zeigt im Verzeichnis, dass die Gruppe gerade Leute aufnimmt.';
const CREATE_NOTE =
  'Die Gruppe steht sofort im Verzeichnis. Personen und Gruppen-Admins trägst du danach ein.';

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface GroupFormDialogProps {
  group: ManagedGroupSummary | null;
  open: boolean;
  onClose: () => void;
  onSaved: (groupId: number) => void;
}

export const GroupFormDialog: FC<GroupFormDialogProps> = ({ group, open, onClose, onSaved }) => {
  const titleId = useId();
  const control = useGroupForm({ group, open, onSaved });
  const kinds = useGroupKindsQuery();
  const heldKind = toHeldGroupKind(group?.groupKindId ?? null, group?.groupKindName ?? null);
  const kindOptions = toGroupKindOptions(kinds.data?.kinds ?? [], heldKind);
  const nameField = control.form.register('name');
  const errors = control.form.formState.errors;

  const nameErrorText = errors.name?.message;
  const descriptionErrorText = errors.description?.message;

  const title = control.isEditing ? EDIT_TITLE : CREATE_TITLE;
  const kicker = group === null ? CREATE_KICKER : group.name;
  const confirmLabel = control.isEditing ? EDIT_CONFIRM : CREATE_CONFIRM;

  const intro = control.isEditing ? null : <KkNote>{CREATE_NOTE}</KkNote>;
  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;

  return (
    <KkModalFrame open={open} onClose={onClose} labelledBy={titleId} closeLabel={CLOSE_LABEL}>
      <KkModalFrame.Kicker>{kicker}</KkModalFrame.Kicker>
      <KkModalFrame.Title id={titleId}>{title}</KkModalFrame.Title>
      <KkModalFrame.Body>{intro}</KkModalFrame.Body>
      <KkModalFrame.Fields>
        <Stack sx={{ gap: 2.25, minWidth: 0 }}>
          <KkTextField
            name={nameField.name}
            label={NAME_LABEL}
            error={nameErrorText !== undefined}
            helperText={nameErrorText}
            onChange={nameField.onChange}
            onBlur={nameField.onBlur}
            inputRef={nameField.ref}
          />
          <KkTextArea
            name="description"
            label={DESCRIPTION_LABEL}
            value={control.description}
            onChange={control.setDescription}
            rows={DESCRIPTION_ROWS}
            maxLength={GROUP_DESCRIPTION_MAX_LENGTH}
            showCount
            countLabel={toCountLabel}
            placeholder={DESCRIPTION_PLACEHOLDER}
            hint={DESCRIPTION_HINT}
            error={descriptionErrorText !== undefined}
            helperText={descriptionErrorText}
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
          <KkSwitchRow
            label={OPENNESS_LABEL}
            checked={control.isRecruiting}
            onChange={control.setRecruiting}
            description={OPENNESS_DESCRIPTION}
          />
        </Stack>
      </KkModalFrame.Fields>
      <KkModalFrame.Footer>
        {rejection}
        <KkButton variant="outlined" onClick={onClose} disabled={control.isSaving}>
          {CANCEL_LABEL}
        </KkButton>
        <KkButton onClick={control.submit} loading={control.isSaving}>
          {confirmLabel}
        </KkButton>
      </KkModalFrame.Footer>
    </KkModalFrame>
  );
};
