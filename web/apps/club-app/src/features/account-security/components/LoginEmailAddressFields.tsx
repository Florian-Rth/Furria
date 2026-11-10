import { KkCheckboxRow } from '@furria/ui/KkCheckboxRow';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import type { UseControllerReturn, UseFormReturn } from 'react-hook-form';
import type { LoginEmailForm } from '../schemas';

const ADDRESS_SECTION = 'Neue E-Mail-Adresse';
const CONTACT_SECTION = 'Kontakt-E-Mail';
const CURRENT_LABEL = 'Jetzt';
const LOGIN_EMAIL_LABEL = 'Neue Anmelde-E-Mail';
const CONTACT_EMAIL_LABEL = 'Kontakt-E-Mail ebenfalls ändern';

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
    <>
      <KkFormSection title={ADDRESS_SECTION}>
        <KkFieldRow label={CURRENT_LABEL} value={currentLoginEmail} />
        <KkTextField
          name={loginEmail.name}
          label={LOGIN_EMAIL_LABEL}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          autoFocus
          error={loginEmailError !== undefined}
          helperText={loginEmailError}
          onChange={loginEmail.onChange}
          onBlur={loginEmail.onBlur}
          inputRef={loginEmail.ref}
        />
      </KkFormSection>
      <KkFormSection title={CONTACT_SECTION}>
        <KkCheckboxRow
          label={CONTACT_EMAIL_LABEL}
          checked={contactEmailFollows.field.value}
          onChange={toggleContactEmail}
        />
      </KkFormSection>
    </>
  );
};
