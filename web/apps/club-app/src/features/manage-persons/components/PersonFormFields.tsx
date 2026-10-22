import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC, ReactNode } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import type { PersonForm } from '../schemas';

const NAME_SECTION_TITLE = 'Name';
const CONTACT_SECTION_TITLE = 'Kontakt';
const ADDRESS_SECTION_TITLE = 'Anschrift';
const EMAIL_HINT =
  'Darüber erreicht der Verein die Person. Ihre Anmelde-E-Mail bleibt davon unberührt.';
const FIRST_NAME_LABEL = 'Vorname';
const LAST_NAME_LABEL = 'Nachname';
const EMAIL_LABEL = 'E-Mail';
const PHONE_LABEL = 'Telefon';
const STREET_LABEL = 'Straße und Hausnummer';
const ZIP_LABEL = 'PLZ';
const CITY_LABEL = 'Ort';

interface PersonFormFieldsProps {
  form: UseFormReturn<PersonForm>;
  errors: FieldErrors<PersonForm>;
  emailSuggestion: ReactNode;
}

export const PersonFormFields: FC<PersonFormFieldsProps> = ({ form, errors, emailSuggestion }) => {
  const firstName = form.register('firstName');
  const lastName = form.register('lastName');
  const email = form.register('email');
  const phone = form.register('phone');
  const street = form.register('street');
  const zip = form.register('zip');
  const city = form.register('city');

  const firstNameError = errors.firstName?.message;
  const lastNameError = errors.lastName?.message;
  const emailError = errors.email?.message;
  const phoneError = errors.phone?.message;
  const streetError = errors.street?.message;
  const zipError = errors.zip?.message;
  const cityError = errors.city?.message;

  return (
    <>
      <KkFormSection title={NAME_SECTION_TITLE}>
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
      </KkFormSection>
      <KkFormSection title={CONTACT_SECTION_TITLE}>
        <KkFormPair
          balance="leading"
          start={
            <KkTextField
              name={email.name}
              label={EMAIL_LABEL}
              type="email"
              inputMode="email"
              autoComplete="email"
              hint={EMAIL_HINT}
              error={emailError !== undefined}
              helperText={emailError}
              onChange={email.onChange}
              onBlur={email.onBlur}
              inputRef={email.ref}
            />
          }
          end={
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
          }
        />
        {emailSuggestion}
      </KkFormSection>
      <KkFormSection title={ADDRESS_SECTION_TITLE}>
        <KkTextField
          name={street.name}
          label={STREET_LABEL}
          autoComplete="street-address"
          error={streetError !== undefined}
          helperText={streetError}
          onChange={street.onChange}
          onBlur={street.onBlur}
          inputRef={street.ref}
        />
        <KkFormPair
          balance="trailing"
          start={
            <KkTextField
              name={zip.name}
              label={ZIP_LABEL}
              inputMode="numeric"
              autoComplete="postal-code"
              error={zipError !== undefined}
              helperText={zipError}
              onChange={zip.onChange}
              onBlur={zip.onBlur}
              inputRef={zip.ref}
            />
          }
          end={
            <KkTextField
              name={city.name}
              label={CITY_LABEL}
              autoComplete="address-level2"
              error={cityError !== undefined}
              helperText={cityError}
              onChange={city.onChange}
              onBlur={city.onBlur}
              inputRef={city.ref}
            />
          }
        />
      </KkFormSection>
    </>
  );
};
