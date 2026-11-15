import { KkButton } from '@furria/ui/KkButton';
import { KkPriceField } from '@furria/ui/KkPriceField';
import { KkTextField } from '@furria/ui/KkTextField';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { DRINK_NAME_MAX } from '../beer-hub';
import { DRINK_NAME_LABEL, PRICE_LABEL } from '../beer-hub-copy';
import type { DrinkForm } from '../hooks/use-drink-form';
import { BeerRejection } from './BeerRejection';

interface BeerDrinkFormBodyProps {
  form: DrinkForm;
  submitLabel: string;
}

export const BeerDrinkFormBody: FC<BeerDrinkFormBodyProps> = ({ form, submitLabel }) => {
  const nameInvalid = form.nameError !== undefined;
  const priceInvalid = form.priceError !== undefined;

  return (
    <>
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        <KkTextField
          name="name"
          label={DRINK_NAME_LABEL}
          value={form.name}
          maxLength={DRINK_NAME_MAX}
          onChange={form.changeName}
          onBlur={form.touchName}
          error={nameInvalid}
          helperText={form.nameError}
        />
        <KkPriceField
          name="price"
          label={PRICE_LABEL}
          value={form.priceText}
          onChange={form.setPriceText}
          error={priceInvalid}
          helperText={form.priceError}
        />
      </Stack>
      <BeerRejection rejection={form.rejection} />
      <KkButton
        variant="outlined"
        disabled={!form.canSubmit}
        loading={form.isSaving}
        onClick={form.submit}
      >
        {submitLabel}
      </KkButton>
    </>
  );
};
