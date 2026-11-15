import { KkButton } from '@furria/ui/KkButton';
import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkNumberField } from '@furria/ui/KkNumberField';
import type { FC } from 'react';
import { STOCK_MAX_CRATES, stockDeltaOf } from '../beer-hub';
import {
  DRINK_LABEL,
  STEP_LABELS,
  STOCK_FIELD_LABEL,
  stockAfterOf,
  stockButtonOf,
} from '../beer-hub-copy';
import { useStockForm } from '../hooks/use-stock-form';
import type { BeerStockDrink } from '../schemas';
import { BeerFieldError } from './BeerFieldError';
import { BeerRejection } from './BeerRejection';

interface BeerStockFormProps {
  beerPotId: number;
  drinks: readonly BeerStockDrink[];
}

export const BeerStockForm: FC<BeerStockFormProps> = ({ beerPotId, drinks }) => {
  const form = useStockForm(beerPotId, drinks);
  const stock = form.drink?.crates ?? 0;
  const cratesInvalid = form.cratesError !== undefined;
  const hint = form.drink === null ? undefined : stockAfterOf(stock, stockDeltaOf(form.change));
  const buttonLabel = stockButtonOf(form.change);
  const floor = -stock;

  return (
    <>
      <KkChoiceChips
        label={DRINK_LABEL}
        choices={form.drinkChoices}
        value={form.drinkValue}
        onChange={form.chooseDrink}
      />
      <BeerFieldError message={form.drinkError} />
      <KkNumberField
        name="crates"
        label={STOCK_FIELD_LABEL}
        value={form.cratesText}
        onChange={form.setCratesText}
        stepLabels={STEP_LABELS}
        min={floor}
        max={STOCK_MAX_CRATES}
        hint={hint}
        error={cratesInvalid}
        helperText={form.cratesError}
      />
      <BeerRejection rejection={form.rejection} />
      <KkButton
        variant="contained"
        size="large"
        disabled={!form.canSubmit}
        loading={form.isSaving}
        onClick={form.submit}
      >
        {buttonLabel}
      </KkButton>
    </>
  );
};
