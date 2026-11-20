import { KkDateField } from '@furria/ui/KkDateField';
import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { ABOUT_SECTION, BIRTH_DATE_LABEL, FIRST_NAME_LABEL, LAST_NAME_LABEL } from '../intake-copy';
import type { NewcomerForm } from '../schemas';

interface IntakeAboutFieldsProps {
  form: UseFormReturn<NewcomerForm>;
}

export const IntakeAboutFields: FC<IntakeAboutFieldsProps> = ({ form }) => {
  const birthDate = useController({ control: form.control, name: 'birthDate' });
  const firstName = form.register('firstName');
  const lastName = form.register('lastName');
  const { errors } = form.formState;
  const firstNameError = errors.firstName?.message;
  const lastNameError = errors.lastName?.message;
  const birthDateError = errors.birthDate?.message;

  return (
    <KkFormSection title={ABOUT_SECTION}>
      <KkFormPair
        start={
          <KkTextField
            name={firstName.name}
            label={FIRST_NAME_LABEL}
            required
            autoComplete="given-name"
            error={firstNameError !== undefined}
            helperText={firstNameError}
            onChange={firstName.onChange}
            onBlur={firstName.onBlur}
            inputRef={firstName.ref}
          />
        }
        end={
          <KkTextField
            name={lastName.name}
            label={LAST_NAME_LABEL}
            required
            autoComplete="family-name"
            error={lastNameError !== undefined}
            helperText={lastNameError}
            onChange={lastName.onChange}
            onBlur={lastName.onBlur}
            inputRef={lastName.ref}
          />
        }
      />
      <KkDateField
        name={birthDate.field.name}
        label={BIRTH_DATE_LABEL}
        value={birthDate.field.value}
        onChange={birthDate.field.onChange}
        required
        error={birthDateError !== undefined}
        helperText={birthDateError}
      />
    </KkFormSection>
  );
};
