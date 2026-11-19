import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { ADDRESS_SECTION, CITY_LABEL, STREET_LABEL, ZIP_LABEL } from '../intake-copy';
import type { NewcomerForm } from '../schemas';

interface IntakeAddressFieldsProps {
  form: UseFormReturn<NewcomerForm>;
}

export const IntakeAddressFields: FC<IntakeAddressFieldsProps> = ({ form }) => {
  const street = form.register('street');
  const zip = form.register('zip');
  const city = form.register('city');
  const { errors } = form.formState;
  const streetError = errors.street?.message;
  const zipError = errors.zip?.message;
  const cityError = errors.city?.message;

  return (
    <KkFormSection title={ADDRESS_SECTION}>
      <KkTextField
        name={street.name}
        label={STREET_LABEL}
        required
        autoComplete="address-line1"
        error={streetError !== undefined}
        helperText={streetError}
        onChange={street.onChange}
        onBlur={street.onBlur}
        inputRef={street.ref}
      />
      <KkFormPair
        balance="trailing"
        phone="side"
        start={
          <KkTextField
            name={zip.name}
            label={ZIP_LABEL}
            required
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
            required
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
  );
};
