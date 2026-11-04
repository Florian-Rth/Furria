import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { useBeerStockMutation } from '../api';
import { causeFor, countOfText, STOCK_CAUSES, stockChangeOf } from '../beer-hub';
import { HUB_LANDING } from '../beer-landing';
import type { BeerWriteState } from '../form-fields';
import { touchingChangeOf, writeStateOf } from '../form-fields';
import type { BeerStockCause, BeerStockChange, BeerStockDirection } from '../schemas';
import { BeerStockFormSchema } from '../schemas';

export interface StockForm extends BeerWriteState {
  direction: BeerStockDirection;
  chooseDirection: (direction: BeerStockDirection) => void;
  causes: readonly BeerStockCause[];
  cause: BeerStockCause | null;
  chooseCause: (cause: BeerStockCause) => void;
  causeError: string | undefined;
  cratesText: string;
  setCratesText: (text: string) => void;
  cratesError: string | undefined;
  change: BeerStockChange | null;
}

export const useStockForm = (beerPotId: number): StockForm => {
  const booking = useBeerStockMutation(beerPotId);
  const write = useWriteForm({
    schema: BeerStockFormSchema,
    defaults: { direction: 'up', cause: 'delivery', crates: '1' },
    mutate: (change) => booking.mutateAsync(change),
    landing: () => HUB_LANDING,
  });
  const directionField = useController({
    control: write.form.control,
    name: 'direction',
    rules: { deps: 'cause' },
  });
  const causeField = useController({ control: write.form.control, name: 'cause' });
  const cratesField = useController({ control: write.form.control, name: 'crates' });
  const direction = directionField.field.value;
  const cause = causeFor(direction, causeField.field.value);

  return {
    direction,
    chooseDirection: touchingChangeOf(directionField.field),
    causes: STOCK_CAUSES[direction],
    cause,
    chooseCause: touchingChangeOf(causeField.field),
    causeError: causeField.fieldState.error?.message,
    cratesText: cratesField.field.value,
    setCratesText: touchingChangeOf(cratesField.field),
    cratesError: cratesField.fieldState.error?.message,
    change: stockChangeOf(direction, cause, countOfText(cratesField.field.value)),
    ...writeStateOf(write),
  };
};
