import { KkButton } from '@furria/ui/KkButton';
import { KkNumberField } from '@furria/ui/KkNumberField';
import type { FC } from 'react';
import type { OpenBeerPot } from '@/features/beer-list/schemas';
import { STOCK_MAX_CRATES, stockDeltaOf } from '../beer-hub';
import { STEP_LABELS, STOCK_FIELD_LABEL, stockAfterOf, stockButtonOf } from '../beer-hub-copy';
import { useStockForm } from '../hooks/use-stock-form';
import { BeerRejection } from './BeerRejection';

interface BeerStockFormProps {
  pot: OpenBeerPot;
  stock: number;
}

export const BeerStockForm: FC<BeerStockFormProps> = ({ pot, stock }) => {
  const form = useStockForm(pot.beerPotId, stock);
  const cratesInvalid = form.cratesError !== undefined;
  const hint = stockAfterOf(stock, stockDeltaOf(form.change));
  const buttonLabel = stockButtonOf(form.change);
  const floor = -stock;

  return (
    <>
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
