import { KkIconButton, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { usePasswordVisibility } from '@/features/login';
import type { PasswordForm } from '../schemas';

const USERNAME_NAME = 'username';
const USERNAME_LABEL = 'Anmelde-E-Mail';
const CURRENT_PASSWORD_LABEL = 'Jetziges Passwort';
const NEW_PASSWORD_LABEL = 'Neues Passwort';
const NEW_PASSWORD_HINT =
  'Mindestens 12 Zeichen, mit Groß- und Kleinbuchstaben, einer Ziffer und einem Sonderzeichen.';

interface PasswordFieldsProps {
  form: UseFormReturn<PasswordForm>;
  errors: FieldErrors<PasswordForm>;
  loginEmail: string;
}

export const PasswordFields: FC<PasswordFieldsProps> = ({ form, errors, loginEmail }) => {
  const currentVisibility = usePasswordVisibility();
  const newVisibility = usePasswordVisibility();
  const currentPassword = form.register('currentPassword');
  const newPassword = form.register('newPassword');
  const currentError = errors.currentPassword?.message;
  const newError = errors.newPassword?.message;

  const currentToggle = (
    <KkIconButton
      label={currentVisibility.toggleLabel}
      icon={currentVisibility.toggleIcon}
      size="small"
      onClick={currentVisibility.toggle}
    />
  );
  const newToggle = (
    <KkIconButton
      label={newVisibility.toggleLabel}
      icon={newVisibility.toggleIcon}
      size="small"
      onClick={newVisibility.toggle}
    />
  );

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <KkTextField
        name={USERNAME_NAME}
        label={USERNAME_LABEL}
        type="email"
        autoComplete="username"
        readOnly
        value={loginEmail}
      />
      <KkTextField
        name={currentPassword.name}
        label={CURRENT_PASSWORD_LABEL}
        type={currentVisibility.fieldType}
        autoComplete="current-password"
        required
        autoFocus
        error={currentError !== undefined}
        helperText={currentError}
        endAdornment={currentToggle}
        onChange={currentPassword.onChange}
        onBlur={currentPassword.onBlur}
        inputRef={currentPassword.ref}
      />
      <KkTextField
        name={newPassword.name}
        label={NEW_PASSWORD_LABEL}
        type={newVisibility.fieldType}
        autoComplete="new-password"
        required
        error={newError !== undefined}
        helperText={newError ?? NEW_PASSWORD_HINT}
        endAdornment={newToggle}
        onChange={newPassword.onChange}
        onBlur={newPassword.onBlur}
        inputRef={newPassword.ref}
      />
    </Stack>
  );
};
