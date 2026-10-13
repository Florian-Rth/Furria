import { KkFormPair, KkFormSection, KkTextField } from '@furria/ui';
import type { FC } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import type { ContactDetailsForm } from '../schemas';

const CONTACT_SECTION_TITLE = 'Kontakt';
const ADDRESS_SECTION_TITLE = 'Anschrift';
const EMAIL_LABEL = 'E-Mail';
const EMAIL_HINT = 'Darüber erreicht dich der Verein. Deine Anmelde-E-Mail bleibt davon unberührt.';
const PHONE_LABEL = 'Telefon';
const STREET_LABEL = 'Straße und Hausnummer';
const ZIP_LABEL = 'PLZ';
const CITY_LABEL = 'Ort';

interface ProfileContactFieldsProps {
  form: UseFormReturn<ContactDetailsForm>;
  errors: FieldErrors<ContactDetailsForm>;
}

export const ProfileContactFields: FC<ProfileContactFieldsProps> = ({ form, errors }) => {
  const email = form.register('email');
  const phone = form.register('phone');
  const street = form.register('street');
  const zip = form.register('zip');
  const city = form.register('city');

  const emailError = errors.email?.message;
  const phoneError = errors.phone?.message;
  const streetError = errors.street?.message;
  const zipError = errors.zip?.message;
  const cityError = errors.city?.message;

  return (
    <>
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
