import { KkNote, KkTextArea, KkTextField } from '@furria/ui';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import { useRoleEditor } from '../hooks/use-role-editor';
import { ROLES_ORIGIN, toRoleOrigin } from '../manage-roles-labels';
import type { RoleDetails } from '../schemas';
import { ROLE_DESCRIPTION_MAX_LENGTH } from '../schemas';

const CREATE_TITLE = 'Rolle hinzufügen';
const EDIT_TITLE = 'Rolle bearbeiten';
const CREATE_EXPLANATION =
  'Eine Rolle bündelt eine Aufgabe im Verein. Die Rechte setzt du danach — eine neue Rolle startet ohne.';
const EDIT_EXPLANATION =
  'Name und Beschreibung stehen so in der Auswahl und in jedem Profil, das die Rolle nennt.';
const NAME_LABEL = 'Name';
const DESCRIPTION_LABEL = 'Beschreibung';
const DESCRIPTION_PLACEHOLDER = 'Wofür ist diese Rolle da?';
const DESCRIPTION_ROWS = 4;
const CREATE_ACTION_LABEL = 'Hinzufügen';
const EDIT_ACTION_LABEL = 'Speichern';
const EMPTY_FORM = { name: '', description: '' };

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface RoleEditorProps {
  roleEntry: RoleDetails | null;
}

export const RoleEditor: FC<RoleEditorProps> = ({ roleEntry }) => {
  const initial =
    roleEntry === null ? EMPTY_FORM : { name: roleEntry.name, description: roleEntry.description };
  const control = useRoleEditor({ roleId: roleEntry?.roleId ?? null, initial });
  const { errors } = control.form.formState;

  const title = roleEntry === null ? CREATE_TITLE : EDIT_TITLE;
  const explanation = roleEntry === null ? CREATE_EXPLANATION : EDIT_EXPLANATION;
  const actionLabel = roleEntry === null ? CREATE_ACTION_LABEL : EDIT_ACTION_LABEL;
  const origin = roleEntry === null ? ROLES_ORIGIN : toRoleOrigin(roleEntry);

  const nameField = control.form.register('name');
  const description = control.form.watch('description');

  const setDescription = (value: string): void => {
    control.form.setValue('description', value, { shouldValidate: false });
  };

  return (
    <WriteScreen
      origin={origin}
      title={title}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: { label: actionLabel, onSelect: control.submit, loading: control.isSaving },
      }}
    >
      <KkNote>{explanation}</KkNote>
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
    </WriteScreen>
  );
};
