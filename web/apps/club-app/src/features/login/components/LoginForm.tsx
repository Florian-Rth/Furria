import { KkAlert, KkButton, KkIconButton, KkTextField, useKkPaneOpen } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useState } from 'react';
import { useLoginForm } from '../hooks/use-login-form';
import { usePasswordVisibility } from '../hooks/use-password-visibility';

export const LoginForm: FC = () => {
  const { form, submit, isSubmitting, submitError } = useLoginForm();
  const password = usePasswordVisibility();
  const isPaneOpen = useKkPaneOpen();
  const [takesFocusOnMount] = useState(isPaneOpen);

  const emailField = form.register('email');
  const passwordField = form.register('password');

  const emailErrorText = form.formState.errors.email?.message;
  const passwordErrorText = form.formState.errors.password?.message;
  const hasEmailError = emailErrorText !== undefined;
  const hasPasswordError = passwordErrorText !== undefined;

  const submitAlert = submitError === null ? null : <KkAlert>{submitError}</KkAlert>;
  const passwordToggle = (
    <KkIconButton
      label={password.toggleLabel}
      icon={password.toggleIcon}
      size="small"
      onClick={password.toggle}
    />
  );

  return (
    <Stack component="form" noValidate onSubmit={submit} sx={{ gap: 2.5 }}>
      <KkTextField
        name={emailField.name}
        label="E-Mail-Adresse"
        type="email"
        inputMode="email"
        autoComplete="username"
        autoFocus={takesFocusOnMount}
        error={hasEmailError}
        helperText={emailErrorText}
        onChange={emailField.onChange}
        onBlur={emailField.onBlur}
        inputRef={emailField.ref}
      />
      <KkTextField
        name={passwordField.name}
        label="Passwort"
        type={password.fieldType}
        autoComplete="current-password"
        error={hasPasswordError}
        helperText={passwordErrorText}
        endAdornment={passwordToggle}
        onChange={passwordField.onChange}
        onBlur={passwordField.onBlur}
        inputRef={passwordField.ref}
      />
      {submitAlert}
      <KkButton type="submit" fullWidth loading={isSubmitting}>
        Anmelden
      </KkButton>
    </Stack>
  );
};
