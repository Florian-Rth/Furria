import { KkAlert, KkButton, KkModalFrame, KkNote, KkTextField } from '@furria/ui';
import type { FC } from 'react';
import { useId } from 'react';
import { useGroupKindForm } from '../hooks/use-group-kind-form';
import type { GroupKindEntry } from '../manage-groups-labels';

const CREATE_TITLE = 'Gruppenart anlegen';
const EDIT_TITLE = 'Gruppenart umbenennen';
const CREATE_KICKER = 'Neue Gruppenart';
const CREATE_EXPLANATION =
  'Eine Gruppenart ordnet Gruppen ein — Garde, Elferrat, Spielmannszug. Welche Gruppe welche Art trägt, legst du danach an der Gruppe fest.';
const EDIT_EXPLANATION =
  'Der Name steht so im Verzeichnis. Die Gruppen, die diese Art tragen, behalten sie — auch nach einer Umbenennung.';
const NAME_LABEL = 'Name';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CREATE_CONFIRM_LABEL = 'Anlegen';
const EDIT_CONFIRM_LABEL = 'Speichern';
const EMPTY_FORM = { name: '' };

interface GroupKindFormDialogProps {
  open: boolean;
  editedKind: GroupKindEntry | null;
  onClose: () => void;
  onSaved: () => void;
}

export const GroupKindFormDialog: FC<GroupKindFormDialogProps> = ({
  open,
  editedKind,
  onClose,
  onSaved,
}) => {
  const titleId = useId();
  const initial = editedKind === null ? EMPTY_FORM : { name: editedKind.name };
  const control = useGroupKindForm({
    groupKindId: editedKind?.groupKindId ?? null,
    open,
    initial,
    onSaved,
  });
  const { errors } = control.form.formState;

  const kicker = editedKind === null ? CREATE_KICKER : editedKind.name;
  const title = editedKind === null ? CREATE_TITLE : EDIT_TITLE;
  const explanation = editedKind === null ? CREATE_EXPLANATION : EDIT_EXPLANATION;
  const confirmLabel = editedKind === null ? CREATE_CONFIRM_LABEL : EDIT_CONFIRM_LABEL;

  const nameField = control.form.register('name');

  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;

  return (
    <KkModalFrame open={open} onClose={onClose} labelledBy={titleId} closeLabel={CLOSE_LABEL}>
      <KkModalFrame.Kicker>{kicker}</KkModalFrame.Kicker>
      <KkModalFrame.Title id={titleId}>{title}</KkModalFrame.Title>
      <KkModalFrame.Body>
        <KkNote>{explanation}</KkNote>
      </KkModalFrame.Body>
      <KkModalFrame.Fields>
        <KkTextField
          name={nameField.name}
          label={NAME_LABEL}
          inputRef={nameField.ref}
          onChange={nameField.onChange}
          onBlur={nameField.onBlur}
          error={errors.name !== undefined}
          helperText={errors.name?.message}
        />
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
