import { KkAlert, KkButton, KkHeading, KkIconButton, KkNote, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC, FormEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { usePasswordVisibility } from '@/features/login';
import { PASSWORD_RULE_HINT } from '@/lib/password-rule';
import type { ResetErrorMessages } from '../reset-messages';
import type { ResetPasswordForm as ResetPasswordValues } from '../schemas';

const TITLE = 'NEUES PASSWORT';
const INTRO = 'Leg ein neues Passwort fest. Danach meldest du dich damit an.';
const PASSWORD_LABEL = 'Neues Passwort';
const SUBMIT_LABEL = 'Passwort festlegen';
const LOGIN_NOTICE = 'Alle Geräte, auf denen du angemeldet bist, werden dabei abgemeldet.';

interface ResetPasswordFormProps {
  form: UseFormReturn<ResetPasswordValues>;
  isResetting: boolean;
  errors: ResetErrorMessages;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: () => void;
}

export const ResetPasswordForm: FC<ResetPasswordFormProps> = ({
  form,
  isResetting,
  errors,
  onSubmit,
  onEdit,
}) => {
  const password = usePasswordVisibility();
  const passwordField = form.register('password');
  const passwordErrorText = form.formState.errors.password?.message ?? errors.password;
  const hasPasswordError = passwordErrorText !== null && passwordErrorText !== undefined;
  const footerAlert = errors.footer === null ? null : <KkAlert>{errors.footer}</KkAlert>;

  const editPassword = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onEdit();
    void passwordField.onChange(event);
  };

  const passwordToggle = (
    <KkIconButton
      label={password.toggleLabel}
      icon={password.toggleIcon}
      size="small"
      onClick={password.toggle}
    />
  );

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <Stack sx={{ gap: 1 }}>
        <KkHeading level={1} component="h1">
          {TITLE}
        </KkHeading>
        <KkNote>{INTRO}</KkNote>
      </Stack>
      <Stack component="form" noValidate onSubmit={onSubmit} sx={{ gap: 2.5 }}>
        <KkTextField
          name={passwordField.name}
          label={PASSWORD_LABEL}
          type={password.fieldType}
          autoComplete="new-password"
          autoFocus
          required
          error={hasPasswordError}
          helperText={passwordErrorText ?? PASSWORD_RULE_HINT}
          endAdornment={passwordToggle}
          onChange={editPassword}
          onBlur={passwordField.onBlur}
          inputRef={passwordField.ref}
        />
        {footerAlert}
        <KkNote>{LOGIN_NOTICE}</KkNote>
        <KkButton type="submit" fullWidth loading={isResetting}>
          {SUBMIT_LABEL}
        </KkButton>
      </Stack>
    </Stack>
  );
};
