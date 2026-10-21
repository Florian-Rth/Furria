import { KkFormSection, KkNote, KkSwitchRow, KkTextArea, KkTextField } from '@furria/ui';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import { useRoleEditor } from '../hooks/use-role-editor';
import { ROLES_ORIGIN, toRoleOrigin } from '../manage-roles-labels';
import { toRoleCoinForm } from '../role-coin';
import type { EditorReturn } from '../roles-hub';
import type { RoleDetails, RoleForm } from '../schemas';
import { ROLE_DESCRIPTION_MAX_LENGTH } from '../schemas';
import { RoleCoinFields } from './RoleCoinFields';

const CREATE_TITLE = 'Rolle hinzufügen';
const EDIT_TITLE = 'Rolle bearbeiten';
const CREATE_EXPLANATION =
  'Neue Rollen haben zunächst keine Rechte. Diese vergibst du im Anschluss.';
const ROLE_SECTION = 'Rolle';
const NAME_LABEL = 'Name';
const NAME_HINT = 'Erscheint in den Profilen und überall, wo Rollen ausgewählt werden.';
const DESCRIPTION_HINT = 'Erklärt in der Rollenübersicht, wofür die Rolle da ist.';
const DESCRIPTION_LABEL = 'Beschreibung';
const DESCRIPTION_PLACEHOLDER = 'Aufgabe der Rolle';
const DESCRIPTION_ROWS = 4;
const CREATE_ACTION_LABEL = 'Hinzufügen';
const EDIT_ACTION_LABEL = 'Speichern';
const COIN_SECTION = 'Abzeichen';
const COIN_SWITCH_LABEL = 'Abzeichen am Profilbild';
const COIN_SWITCH_DESCRIPTION =
  'Wer die Rolle innehat, trägt am Profilbild ein Abzeichen in dieser Farbe mit diesem Symbol.';
const EMPTY_FORM: RoleForm = {
  name: '',
  description: '',
  showsCoin: false,
  coinIcon: null,
  coinTone: null,
};

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface RoleEditorProps {
  roleEntry: RoleDetails | null;
  returnTo: EditorReturn;
}

export const RoleEditor: FC<RoleEditorProps> = ({ roleEntry, returnTo }) => {
  const initial: RoleForm =
    roleEntry === null
      ? EMPTY_FORM
      : {
          name: roleEntry.name,
          description: roleEntry.description,
          ...toRoleCoinForm(roleEntry.coin),
        };
  const control = useRoleEditor({ roleId: roleEntry?.roleId ?? null, initial, returnTo });
  const { errors } = control.form.formState;

  const title = roleEntry === null ? CREATE_TITLE : EDIT_TITLE;
  const intro = roleEntry === null ? <KkNote>{CREATE_EXPLANATION}</KkNote> : null;
  const actionLabel = roleEntry === null ? CREATE_ACTION_LABEL : EDIT_ACTION_LABEL;
  const origin = roleEntry === null ? ROLES_ORIGIN : toRoleOrigin(roleEntry, returnTo);

  const nameField = control.form.register('name');
  const coinFields = control.showsCoin ? (
    <RoleCoinFields
      icon={control.coinIcon}
      onIconChange={control.setCoinIcon}
      tone={control.coinTone}
      onToneChange={control.setCoinTone}
    />
  ) : null;

  return (
    <WriteScreen
      origin={origin}
      title={title}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: {
          label: actionLabel,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      {intro}
      <KkFormSection title={ROLE_SECTION}>
        <KkTextField
          name={nameField.name}
          label={NAME_LABEL}
          required
          hint={NAME_HINT}
          inputRef={nameField.ref}
          onChange={nameField.onChange}
          onBlur={nameField.onBlur}
          error={errors.name !== undefined}
          helperText={errors.name?.message}
        />
        <KkTextArea
          name="description"
          label={DESCRIPTION_LABEL}
          value={control.description}
          onChange={control.setDescription}
          onBlur={control.touchDescription}
          rows={DESCRIPTION_ROWS}
          maxLength={ROLE_DESCRIPTION_MAX_LENGTH}
          showCount
          countLabel={toCountLabel}
          placeholder={DESCRIPTION_PLACEHOLDER}
          hint={DESCRIPTION_HINT}
          error={errors.description !== undefined}
          helperText={errors.description?.message}
        />
      </KkFormSection>
      <KkFormSection title={COIN_SECTION}>
        <KkSwitchRow
          label={COIN_SWITCH_LABEL}
          description={COIN_SWITCH_DESCRIPTION}
          checked={control.showsCoin}
          onChange={control.setShowsCoin}
        />
        {coinFields}
      </KkFormSection>
    </WriteScreen>
  );
};
