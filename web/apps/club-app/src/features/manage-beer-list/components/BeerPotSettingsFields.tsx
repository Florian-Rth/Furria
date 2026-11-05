import { KkPriceField } from '@furria/ui/KkPriceField';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import { LINK_HINT, LINK_LABEL, PRICE_HINT, PRICE_LABEL } from '../beer-hub-copy';
import type { PotFields } from '../hooks/use-pot-fields';

interface BeerPotSettingsFieldsProps {
  fields: PotFields;
}

export const BeerPotSettingsFields: FC<BeerPotSettingsFieldsProps> = ({ fields }) => {
  const priceInvalid = fields.priceError !== undefined;
  const priceHelper = fields.priceError ?? PRICE_HINT;

  return (
    <>
      <KkPriceField
        name="cratePrice"
        label={PRICE_LABEL}
        value={fields.priceText}
        onChange={fields.setPriceText}
        error={priceInvalid}
        helperText={priceHelper}
      />
      <KkTextField
        name="paymentLink"
        label={LINK_LABEL}
        type="url"
        value={fields.link}
        onChange={fields.changeLink}
        onBlur={fields.touchLink}
        hint={LINK_HINT}
      />
    </>
  );
};
