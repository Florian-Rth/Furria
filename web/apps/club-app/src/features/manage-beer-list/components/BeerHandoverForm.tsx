import { KkHoldButton } from '@furria/ui/KkHoldButton';
import type { FC } from 'react';
import { stockOfDrinks } from '../beer-hub';
import {
  carriedDrinkLabelOf,
  firstNameOf,
  HANDOVER_LABEL,
  HOLD_HINT,
  handoverConfirmOf,
  SUCCESSOR_LABEL,
} from '../beer-hub-copy';
import type { DrinkRowField } from '../hooks/use-drink-rows';
import { useHandoverForm } from '../hooks/use-handover-form';
import type { BeerStockDrink } from '../schemas';
import { BeerCarriedPriceRow } from './BeerCarriedPriceRow';
import { BeerPaymentLinkField } from './BeerPaymentLinkField';
import { BeerPotPersonField } from './BeerPotPersonField';
import { BeerRejection } from './BeerRejection';

interface BeerHandoverFormProps {
  beerPotId: number;
  carried: readonly BeerStockDrink[];
}

const carriedCratesOf = (carried: readonly BeerStockDrink[], row: DrinkRowField): number =>
  carried.find((drink) => drink.beerDrinkId === row.beerDrinkId)?.crates ?? 0;

export const BeerHandoverForm: FC<BeerHandoverFormProps> = ({ beerPotId, carried }) => {
  const form = useHandoverForm(beerPotId, carried);
  const confirm = handoverConfirmOf(firstNameOf(form.fields.person), stockOfDrinks(carried));
  const priceRows = form.drinks.rows.map((row) => {
    const label = carriedDrinkLabelOf(row.name, carriedCratesOf(carried, row));

    return <BeerCarriedPriceRow key={row.key} row={row} label={label} />;
  });

  return (
    <>
      <BeerPotPersonField label={SUCCESSOR_LABEL} fields={form.fields} />
      {priceRows}
      <BeerPaymentLinkField fields={form.fields} />
      <BeerRejection rejection={form.rejection} />
      <KkHoldButton
        label={HANDOVER_LABEL}
        hint={HOLD_HINT}
        tone="danger"
        confirm={confirm}
        disabled={!form.canSubmit}
        onCommit={form.submit}
      />
    </>
  );
};
