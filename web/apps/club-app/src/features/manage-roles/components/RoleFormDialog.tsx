import { KkAlert, KkButton, KkModalFrame, KkNote, KkTextArea, KkTextField } from '@furria/ui';
import type { FC } from 'react';
import { useId } from 'react';
import { useRoleForm } from '../hooks/use-role-form';
import type { RoleDetails } from '../schemas';
import { ROLE_DESCRIPTION_MAX_LENGTH } from '../schemas';

const CREATE_TITLE = 'Rolle anlegen';
const EDIT_TITLE = 'Rolle bearbeiten';
const CREATE_KICKER = 'Neue Rolle';
const CREATE_EXPLANATION =
  'Eine Rolle bündelt eine Aufgabe im Verein. Die Rechte setzt du danach — eine neue Rolle startet ohne.';
const EDIT_EXPLANATION =
  'Name und Beschreibung stehen so in der Auswahl und in jedem Profil, das die Rolle nennt.';
const NAME_LABEL = 'Name';
const DESCRIPTION_LABEL = 'Beschreibung';
const DESCRIPTION_PLACEHOLDER = 'Wofür ist diese Rolle da?';
const DESCRIPTION_ROWS = 4;
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CREATE_CONFIRM_LABEL = 'Anlegen';
const EDIT_CONFIRM_LABEL = 'Speichern';
const EMPTY_FORM = { name: '', description: '' };

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface RoleFormDialogProps {
  open: boolean;
  editedRole: RoleDetails | null;
  onClose: () => void;
  onSaved: (roleId: number | null) => void;
}

export const RoleFormDialog: FC<RoleFormDialogProps> = ({ open, editedRole, onClose, onSaved }) => {
  const titleId = useId();
  const initial =
    editedRole === null
      ? EMPTY_FORM
      : { name: editedRole.name, description: editedRole.description };
  const control = useRoleForm({ roleId: editedRole?.roleId ?? null, open, initial, onSaved });
  const { errors } = control.form.formState;

  const kicker = editedRole === null ? CREATE_KICKER : editedRole.name;
  const title = editedRole === null ? CREATE_TITLE : EDIT_TITLE;
  const explanation = editedRole === null ? CREATE_EXPLANATION : EDIT_EXPLANATION;
  const confirmLabel = editedRole === null ? CREATE_CONFIRM_LABEL : EDIT_CONFIRM_LABEL;

  const nameField = control.form.register('name');
  const description = control.form.watch('description');

  const setDescription = (value: string): void => {
    control.form.setValue('description', value, { shouldValidate: false });
  };

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
        <KkTextArea
          name="description"
          label={DESCRIPTION_LABEL}
          value={description}
          onChange={setDescription}
          rows={DESCRIPTION_ROWS}
          maxLength={ROLE_DESCRIPTION_MAX_LENGTH}
          showCount
          countLabel={toCountLabel}
          placeholder={DESCRIPTION_PLACEHOLDER}
          error={errors.description !== undefined}
          helperText={errors.description?.message}
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
