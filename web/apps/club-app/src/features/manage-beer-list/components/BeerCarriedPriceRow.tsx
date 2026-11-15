import { KkPriceField } from '@furria/ui/KkPriceField';
import type { FC } from 'react';
import type { DrinkRowField } from '../hooks/use-drink-rows';

interface BeerCarriedPriceRowProps {
  row: DrinkRowField;
  label: string;
}

export const BeerCarriedPriceRow: FC<BeerCarriedPriceRowProps> = ({ row, label }) => {
  const priceInvalid = row.priceError !== undefined;

  return (
    <KkPriceField
      name={`drink-price-${row.key}`}
      label={label}
      value={row.priceText}
      onChange={row.setPriceText}
      error={priceInvalid}
      helperText={row.priceError}
    />
  );
};
