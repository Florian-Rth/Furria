import { KkButton } from '@furria/ui/KkButton';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import type { FC } from 'react';
import type { OpenBeerPot } from '@/features/beer-list/schemas';
import { stockDeltaOf } from '../beer-hub';
import {
  CAUSE_LABEL,
  CAUSE_LABELS,
  COUNT_FIELD_LABEL,
  DIRECTION_LABEL,
  DIRECTION_LABELS,
  STEP_LABELS,
  stockAfterOf,
  stockButtonOf,
} from '../beer-hub-copy';
import { useStockForm } from '../hooks/use-stock-form';
import type { BeerStockCause } from '../schemas';
import { BeerStockCauseSchema, BeerStockDirectionSchema } from '../schemas';
import { BeerRejection } from './BeerRejection';

const NO_CAUSE = '';

const DIRECTION_OPTIONS = BeerStockDirectionSchema.options.map((direction) => ({
  value: direction,
  label: DIRECTION_LABELS[direction],
}));

const causeOptionOf = (cause: BeerStockCause): { value: string; label: string } => ({
  value: cause,
  label: CAUSE_LABELS[cause],
});

interface BeerStockFormProps {
  pot: OpenBeerPot;
  stock: number;
}

export const BeerStockForm: FC<BeerStockFormProps> = ({ pot, stock }) => {
  const form = useStockForm(pot.beerPotId);
  const causeOptions = form.causes.map(causeOptionOf);
  const causeValue = form.cause ?? NO_CAUSE;
  const causeInvalid = form.causeError !== undefined;
  const cratesInvalid = form.cratesError !== undefined;
  const hint = stockAfterOf(stock, stockDeltaOf(form.change));
  const buttonLabel = stockButtonOf(form.change);
  const chooseDirection = (value: string): void => {
    const direction = BeerStockDirectionSchema.safeParse(value);

    if (direction.success) {
      form.chooseDirection(direction.data);
    }
  };
  const chooseCause = (value: string): void => {
    const cause = BeerStockCauseSchema.safeParse(value);

    if (cause.success) {
      form.chooseCause(cause.data);
    }
  };

  return (
    <>
      <KkSelectField
        name="direction"
        label={DIRECTION_LABEL}
        value={form.direction}
        options={DIRECTION_OPTIONS}
        presentation="choices"
        onChange={chooseDirection}
      />
      <KkSelectField
        name="cause"
        label={CAUSE_LABEL}
        value={causeValue}
        options={causeOptions}
        presentation="choices"
        onChange={chooseCause}
        error={causeInvalid}
        helperText={form.causeError}
      />
      <KkNumberField
        name="crates"
        label={COUNT_FIELD_LABEL}
        value={form.cratesText}
        onChange={form.setCratesText}
        stepLabels={STEP_LABELS}
        min={1}
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
