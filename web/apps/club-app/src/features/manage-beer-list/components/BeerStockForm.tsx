import { KkButton } from '@furria/ui/KkButton';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkSelectField } from '@furria/ui/KkSelectField';
import type { FC } from 'react';
import type { BeerStockCause, BeerStockDirection } from '../beer-hub';
import { stockDeltaOf } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
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
import type { OpenBeerPot } from '../schemas';

const DIRECTIONS: readonly BeerStockDirection[] = ['up', 'down'];

const DIRECTION_OPTIONS = DIRECTIONS.map((direction) => ({
  value: direction,
  label: DIRECTION_LABELS[direction],
}));

const isDirection = (value: string): value is BeerStockDirection =>
  DIRECTIONS.some((direction) => direction === value);

interface BeerStockFormProps {
  pot: OpenBeerPot;
  stock: number;
}

export const BeerStockForm: FC<BeerStockFormProps> = ({ pot, stock }) => {
  const hub = useBeerHubContext();
  const form = useStockForm(pot.beerPotId, hub.closePane);
  const causeOptions = form.causes.map((cause) => ({ value: cause, label: CAUSE_LABELS[cause] }));
  const hint = stockAfterOf(stock, stockDeltaOf(form.change));
  const buttonLabel = stockButtonOf(form.change);
  const chooseDirection = (value: string): void => {
    if (isDirection(value)) {
      form.chooseDirection(value);
    }
  };
  const chooseCause = (value: string): void => {
    const cause = form.causes.find((option): option is BeerStockCause => option === value);

    if (cause !== undefined) {
      form.chooseCause(cause);
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
        value={form.cause ?? ''}
        options={causeOptions}
        presentation="choices"
        onChange={chooseCause}
      />
      <KkNumberField
        name="crates"
        label={COUNT_FIELD_LABEL}
        value={form.countText}
        onChange={form.setCountText}
        stepLabels={STEP_LABELS}
        min={1}
        hint={hint}
      />
      <KkButton
        variant="contained"
        size="large"
        disabled={form.change === null || form.busy}
        onClick={form.submit}
      >
        {buttonLabel}
      </KkButton>
    </>
  );
};
