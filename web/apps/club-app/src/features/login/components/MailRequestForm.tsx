import { KkAlert, KkButton, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useMailRequestForm } from '../hooks/use-mail-request-form';

const EMAIL_LABEL = 'E-Mail-Adresse';

interface MailRequestFormProps {
  hint: string;
  submitLabel: string;
  isRequesting: boolean;
  failure: string | null;
  onRequest: (email: string) => void;
}

export const MailRequestForm: FC<MailRequestFormProps> = ({
  hint,
  submitLabel,
  isRequesting,
  failure,
  onRequest,
}) => {
  const { form, submit } = useMailRequestForm(onRequest);
  const emailField = form.register('email');
  const emailErrorText = form.formState.errors.email?.message;
  const hasEmailError = emailErrorText !== undefined;
  const failureAlert = failure === null ? null : <KkAlert>{failure}</KkAlert>;

  return (
    <Stack component="form" noValidate onSubmit={submit} sx={{ gap: 2.5 }}>
      <KkTextField
        name={emailField.name}
        label={EMAIL_LABEL}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoFocus
        required
        error={hasEmailError}
        helperText={emailErrorText ?? hint}
        onChange={emailField.onChange}
        onBlur={emailField.onBlur}
        inputRef={emailField.ref}
      />
      {failureAlert}
      <KkButton type="submit" fullWidth loading={isRequesting}>
        {submitLabel}
      </KkButton>
    </Stack>
  );
};
