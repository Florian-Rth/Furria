import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import type { ClubContactForm } from '../schemas';

const STREET_LABEL = 'Straße und Hausnummer';
const ZIP_LABEL = 'PLZ';
const CITY_LABEL = 'Ort';
const EMAIL_LABEL = 'E-Mail';
const PHONE_LABEL = 'Telefon';
const WEBSITE_LABEL = 'Website';
const INSTAGRAM_LABEL = 'Instagram';
const FACEBOOK_LABEL = 'Facebook';
const ADDRESS_SECTION_TITLE = 'Anschrift';
const REACH_SECTION_TITLE = 'Erreichbarkeit';
const EMAIL_HINT =
  'Steht im Impressum und überall auf der Website, wo Gäste dem Verein schreiben können.';
const PHONE_HINT = 'Steht im Impressum und auf der Website unter „Mitglied werden“.';
const WEB_SECTION_TITLE = 'Im Netz';
const WEBSITE_HINT = 'Die ganze Adresse, mit https://. Steht im Impressum der Website.';
const INSTAGRAM_HINT = 'Die ganze Adresse, mit https://. Verlinkt in der Fußzeile der Website.';
const FACEBOOK_HINT = 'Die ganze Adresse, mit https://. Verlinkt in der Fußzeile der Website.';

interface ClubContactFieldsProps {
  form: UseFormReturn<ClubContactForm>;
  errors: FieldErrors<ClubContactForm>;
}

export const ClubContactFields: FC<ClubContactFieldsProps> = ({ form, errors }) => {
  const street = form.register('street');
  const zip = form.register('zip');
  const city = form.register('city');
  const email = form.register('email');
  const phone = form.register('phone');
  const websiteUrl = form.register('websiteUrl');
  const instagramUrl = form.register('instagramUrl');
  const facebookUrl = form.register('facebookUrl');

  const streetError = errors.street?.message;
  const zipError = errors.zip?.message;
  const cityError = errors.city?.message;
  const emailError = errors.email?.message;
  const phoneError = errors.phone?.message;
  const websiteUrlError = errors.websiteUrl?.message;
  const instagramUrlError = errors.instagramUrl?.message;
  const facebookUrlError = errors.facebookUrl?.message;

  return (
    <>
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
      <KkFormSection title={REACH_SECTION_TITLE}>
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
        <KkTextField
          name={phone.name}
          label={PHONE_LABEL}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          hint={PHONE_HINT}
          error={phoneError !== undefined}
          helperText={phoneError}
          onChange={phone.onChange}
          onBlur={phone.onBlur}
          inputRef={phone.ref}
        />
      </KkFormSection>
      <KkFormSection title={WEB_SECTION_TITLE}>
        <KkTextField
          name={websiteUrl.name}
          label={WEBSITE_LABEL}
          type="url"
          inputMode="url"
          hint={WEBSITE_HINT}
          error={websiteUrlError !== undefined}
          helperText={websiteUrlError}
          onChange={websiteUrl.onChange}
          onBlur={websiteUrl.onBlur}
          inputRef={websiteUrl.ref}
        />
        <KkTextField
          name={instagramUrl.name}
          label={INSTAGRAM_LABEL}
          type="url"
          inputMode="url"
          hint={INSTAGRAM_HINT}
          error={instagramUrlError !== undefined}
          helperText={instagramUrlError}
          onChange={instagramUrl.onChange}
          onBlur={instagramUrl.onBlur}
          inputRef={instagramUrl.ref}
        />
        <KkTextField
          name={facebookUrl.name}
          label={FACEBOOK_LABEL}
          type="url"
          inputMode="url"
          hint={FACEBOOK_HINT}
          error={facebookUrlError !== undefined}
          helperText={facebookUrlError}
          onChange={facebookUrl.onChange}
          onBlur={facebookUrl.onBlur}
          inputRef={facebookUrl.ref}
        />
      </KkFormSection>
    </>
  );
};
