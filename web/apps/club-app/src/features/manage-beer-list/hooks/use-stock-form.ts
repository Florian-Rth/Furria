import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { useBeerStockMutation } from '../api';
import { initialStockDrinkOf, signedCountOfText, stockChangeOf } from '../beer-hub';
import { carriedDrinkLabelOf } from '../beer-hub-copy';
import { HUB_LANDING } from '../beer-landing';
import type { BeerWriteState } from '../form-fields';
import { touchingChangeOf, writeStateOf } from '../form-fields';
import type { BeerStockChange, BeerStockDrink } from '../schemas';
import { beerStockFormSchema } from '../schemas';

export interface StockForm extends BeerWriteState {
  drinkChoices: readonly KkChoiceChip[];
  drinkValue: string | null;
  chooseDrink: (value: string) => void;
  drinkError: string | undefined;
  drink: BeerStockDrink | null;
  cratesText: string;
  setCratesText: (text: string) => void;
  cratesError: string | undefined;
  change: BeerStockChange | null;
}

const drinkChoiceOf = (drink: BeerStockDrink): KkChoiceChip => ({
  id: String(drink.beerDrinkId),
  label: carriedDrinkLabelOf(drink.name, drink.crates),
});

export const useStockForm = (beerPotId: number, drinks: readonly BeerStockDrink[]): StockForm => {
  const booking = useBeerStockMutation(beerPotId);
  const write = useWriteForm({
    schema: beerStockFormSchema(drinks),
    defaults: { beerDrinkId: initialStockDrinkOf(drinks), crates: '1' },
    mutate: (booked) => {
      const drinkName =
        drinks.find((drink) => drink.beerDrinkId === booked.beerDrinkId)?.name ?? '';

      return booking.mutateAsync({ ...booked, drinkName });
    },
    landing: () => HUB_LANDING,
  });
  const drinkField = useController({ control: write.form.control, name: 'beerDrinkId' });
  const cratesField = useController({ control: write.form.control, name: 'crates' });
  const drinkValue = drinkField.field.value;

  return {
    drinkChoices: drinks.map(drinkChoiceOf),
    drinkValue: drinkValue === '' ? null : drinkValue,
    chooseDrink: touchingChangeOf(drinkField.field),
    drinkError: drinkField.fieldState.error?.message,
    drink: drinks.find((drink) => String(drink.beerDrinkId) === drinkValue) ?? null,
    cratesText: cratesField.field.value,
    setCratesText: touchingChangeOf(cratesField.field),
    cratesError: cratesField.fieldState.error?.message,
    change: stockChangeOf(signedCountOfText(cratesField.field.value)),
    ...writeStateOf(write),
  };
};
