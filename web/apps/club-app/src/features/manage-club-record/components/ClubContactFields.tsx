import { KkTextField } from '@furria/ui';
import Grid from '@mui/material/Grid';
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
const LINK_HINT = 'Die ganze Adresse, mit https://.';

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
    <Grid container spacing={1.5} sx={{ minWidth: 0 }}>
      <Grid size={12} sx={{ minWidth: 0 }}>
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
      </Grid>
      <Grid size={4} sx={{ minWidth: 0 }}>
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
      </Grid>
      <Grid size={8} sx={{ minWidth: 0 }}>
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
      </Grid>
      <Grid size={12} sx={{ minWidth: 0 }}>
        <KkTextField
          name={email.name}
          label={EMAIL_LABEL}
          type="email"
          autoComplete="email"
          error={emailError !== undefined}
          helperText={emailError}
          onChange={email.onChange}
          onBlur={email.onBlur}
          inputRef={email.ref}
        />
      </Grid>
      <Grid size={12} sx={{ minWidth: 0 }}>
        <KkTextField
          name={phone.name}
          label={PHONE_LABEL}
          type="tel"
          autoComplete="tel"
          error={phoneError !== undefined}
          helperText={phoneError}
          onChange={phone.onChange}
          onBlur={phone.onBlur}
          inputRef={phone.ref}
        />
      </Grid>
      <Grid size={12} sx={{ minWidth: 0 }}>
        <KkTextField
          name={websiteUrl.name}
          label={WEBSITE_LABEL}
          type="url"
          error={websiteUrlError !== undefined}
          helperText={websiteUrlError ?? LINK_HINT}
          onChange={websiteUrl.onChange}
          onBlur={websiteUrl.onBlur}
          inputRef={websiteUrl.ref}
        />
      </Grid>
      <Grid size={12} sx={{ minWidth: 0 }}>
        <KkTextField
          name={instagramUrl.name}
          label={INSTAGRAM_LABEL}
          type="url"
          error={instagramUrlError !== undefined}
          helperText={instagramUrlError}
          onChange={instagramUrl.onChange}
          onBlur={instagramUrl.onBlur}
          inputRef={instagramUrl.ref}
        />
      </Grid>
      <Grid size={12} sx={{ minWidth: 0 }}>
        <KkTextField
          name={facebookUrl.name}
          label={FACEBOOK_LABEL}
          type="url"
          error={facebookUrlError !== undefined}
          helperText={facebookUrlError}
          onChange={facebookUrl.onChange}
          onBlur={facebookUrl.onBlur}
          inputRef={facebookUrl.ref}
        />
      </Grid>
    </Grid>
  );
};
