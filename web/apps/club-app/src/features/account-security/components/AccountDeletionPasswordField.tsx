import { KkIconButton, KkTextField } from '@furria/ui';
import type { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { usePasswordVisibility } from '@/features/login';
import type { AccountDeletionForm } from '../schemas';

const PASSWORD_LABEL = 'Dein Passwort';

interface AccountDeletionPasswordFieldProps {
  form: UseFormReturn<AccountDeletionForm>;
  error: string | undefined;
}

export const AccountDeletionPasswordField: FC<AccountDeletionPasswordFieldProps> = ({
  form,
  error,
}) => {
  const visibility = usePasswordVisibility();
  const password = form.register('password');
  const toggle = (
    <KkIconButton
      label={visibility.toggleLabel}
      icon={visibility.toggleIcon}
      size="small"
      onClick={visibility.toggle}
    />
  );

  return (
    <KkTextField
      name={password.name}
      label={PASSWORD_LABEL}
      type={visibility.fieldType}
      autoComplete="current-password"
      required
      error={error !== undefined}
      helperText={error}
      endAdornment={toggle}
      onChange={password.onChange}
      onBlur={password.onBlur}
      inputRef={password.ref}
    />
  );
};
