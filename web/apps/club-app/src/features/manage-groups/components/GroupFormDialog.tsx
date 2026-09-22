import { KkAlert, KkButton, KkModalFrame, KkNote, KkSelectField, KkTextField } from '@furria/ui';
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

const CREATE_TITLE = 'Gruppe anlegen';
const EDIT_TITLE = 'Gruppe bearbeiten';
const CREATE_KICKER = 'Gruppenverwaltung';
const CREATE_CONFIRM = 'Anlegen';
const EDIT_CONFIRM = 'Speichern';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';

const NAME_LABEL = 'Name der Gruppe';
const CREATE_NOTE =
  'Die Gruppe steht sofort im Verzeichnis. Ernenne ihr danach einen Gruppen-Admin — Beschreibung, Farbe und Training schreibt die Gruppe dann selbst.';

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
          <KkSelectField
            name="groupKindId"
            label={GROUP_KIND_FIELD_LABEL}
            value={control.groupKindId}
            options={kindOptions}
            onChange={control.setGroupKindId}
            presentation="select"
            hint={GROUP_KIND_FIELD_HINT}
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
