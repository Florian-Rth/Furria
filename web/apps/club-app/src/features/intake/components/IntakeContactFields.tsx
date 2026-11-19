import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';
import {
  CONTACT_SECTION,
  EMAIL_HINT,
  EMAIL_LABEL,
  PHONE_LABEL,
  VISIBILITY_LABEL,
} from '../intake-copy';
import type { NewcomerForm } from '../schemas';

interface IntakeContactFieldsProps {
  form: UseFormReturn<NewcomerForm>;
}

export const IntakeContactFields: FC<IntakeContactFieldsProps> = ({ form }) => {
  const contactVisible = useController({ control: form.control, name: 'contactVisibleToMembers' });
  const email = form.register('email');
  const phone = form.register('phone');
  const { errors } = form.formState;
  const emailError = errors.email?.message;
  const phoneError = errors.phone?.message;

  return (
    <KkFormSection title={CONTACT_SECTION}>
      <KkTextField
        name={email.name}
        label={EMAIL_LABEL}
        type="email"
        inputMode="email"
        autoComplete="email"
        error={emailError !== undefined}
        helperText={emailError ?? EMAIL_HINT}
        onChange={email.onChange}
        onBlur={email.onBlur}
        inputRef={email.ref}
      />
      <KkTextField
        name={phone.name}
        label={PHONE_LABEL}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        error={phoneError !== undefined}
        helperText={phoneError}
        onChange={phone.onChange}
        onBlur={phone.onBlur}
        inputRef={phone.ref}
      />
      <KkSwitchRow
        label={VISIBILITY_LABEL}
        checked={contactVisible.field.value}
        onChange={contactVisible.field.onChange}
      />
    </KkFormSection>
  );
};
