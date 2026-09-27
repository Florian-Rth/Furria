import { KkCheckboxRow, KkFieldRow, KkPanel, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { UseControllerReturn, UseFormReturn } from 'react-hook-form';
import type { LoginEmailForm } from '../schemas';

const CURRENT_LABEL = 'Jetzt';
const LOGIN_EMAIL_LABEL = 'Neue Anmelde-E-Mail';
const LOGIN_EMAIL_HINT = 'Wir schicken dir einen Code dorthin, damit du die Adresse bestätigst.';
const CONTACT_EMAIL_LABEL = 'Kontakt-E-Mail ebenfalls ändern';
const CONTACT_EMAIL_DESCRIPTION =
  'Der Verein erreicht dich dann unter der neuen Adresse. Ohne Haken bleibt deine Kontakt-E-Mail, wie sie ist.';

interface LoginEmailAddressFieldsProps {
  form: UseFormReturn<LoginEmailForm>;
  contactEmailFollows: UseControllerReturn<LoginEmailForm, 'updateContactEmail'>;
  currentLoginEmail: string;
}

export const LoginEmailAddressFields: FC<LoginEmailAddressFieldsProps> = ({
  form,
  contactEmailFollows,
  currentLoginEmail,
}) => {
  const loginEmail = form.register('loginEmail');
  const loginEmailError = form.formState.errors.loginEmail?.message;

  const toggleContactEmail = (checked: boolean): void => {
    contactEmailFollows.field.onChange(checked);
  };

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <KkPanel>
        <KkFieldRow label={CURRENT_LABEL} value={currentLoginEmail} />
      </KkPanel>
      <KkTextField
        name={loginEmail.name}
        label={LOGIN_EMAIL_LABEL}
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        autoFocus
        error={loginEmailError !== undefined}
        helperText={loginEmailError ?? LOGIN_EMAIL_HINT}
        onChange={loginEmail.onChange}
        onBlur={loginEmail.onBlur}
        inputRef={loginEmail.ref}
      />
      <KkCheckboxRow
        label={CONTACT_EMAIL_LABEL}
        description={CONTACT_EMAIL_DESCRIPTION}
        checked={contactEmailFollows.field.value}
        onChange={toggleContactEmail}
      />
    </Stack>
  );
};
