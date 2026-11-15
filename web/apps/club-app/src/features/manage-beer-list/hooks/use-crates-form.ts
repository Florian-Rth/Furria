import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { WriteLanding } from '@/features/write/landing-target';
import type { PersonRef } from '@/lib/api/schemas';
import { useBeerCratesForMutation } from '../api';
import { countOfText, drinkLimitsOf, initialDrinkOf } from '../beer-hub';
import { drinkChoiceLabelOf } from '../beer-hub-copy';
import type { BeerWriteState } from '../form-fields';
import { touchingChangeOf, writeStateOf } from '../form-fields';
import type { BeerStockDrink } from '../schemas';
import { beerCratesFormSchema } from '../schemas';

const NO_PERSON = '';

export interface CratesForm extends BeerWriteState {
  personValue: string;
  choosePerson: (value: string) => void;
  personError: string | undefined;
  person: PersonRef | null;
  drinkChoices: readonly KkChoiceChip[];
  drinkValue: string | null;
  chooseDrink: (value: string) => void;
  drinkError: string | undefined;
  drink: BeerStockDrink | null;
  countText: string;
  setCountText: (text: string) => void;
  countError: string | undefined;
  count: number;
  maxCount: number;
  paid: boolean;
  setPaid: (paid: boolean) => void;
}

export interface CratesFormSource {
  beerPotId: number;
  candidates: readonly PersonRef[];
  drinks: readonly BeerStockDrink[];
  initialPersonId: number | null;
  landing: WriteLanding;
}

const initialPersonOf = (source: CratesFormSource): string =>
  source.candidates.some((candidate) => candidate.personId === source.initialPersonId)
    ? String(source.initialPersonId)
    : NO_PERSON;

const drinkChoiceOf = (drink: BeerStockDrink): KkChoiceChip => ({
  id: String(drink.beerDrinkId),
  label: drinkChoiceLabelOf(drink.name, drink.crates),
  disabled: drink.crates < 1,
});

export const useCratesForm = (source: CratesFormSource): CratesForm => {
  const booking = useBeerCratesForMutation(source.beerPotId);
  const limits = drinkLimitsOf(source.drinks);
  const write = useWriteForm({
    schema: beerCratesFormSchema(
      source.candidates.map((candidate) => candidate.personId),
      limits,
    ),
    defaults: {
      personId: initialPersonOf(source),
      beerDrinkId: initialDrinkOf(source.drinks),
      count: '1',
      paid: false,
    },
    mutate: (booked) => {
      const name =
        source.candidates.find((candidate) => candidate.personId === booked.personId)?.firstName ??
        '';
      const drinkName =
        source.drinks.find((drink) => drink.beerDrinkId === booked.beerDrinkId)?.name ?? '';

      return booking.mutateAsync({ ...booked, drinkName, name });
    },
    landing: () => source.landing,
  });
  const personField = useController({ control: write.form.control, name: 'personId' });
  const drinkField = useController({ control: write.form.control, name: 'beerDrinkId' });
  const countField = useController({ control: write.form.control, name: 'count' });
  const paidField = useController({ control: write.form.control, name: 'paid' });
  const personValue = personField.field.value;
  const drinkValue = drinkField.field.value;
  const drink = source.drinks.find((entry) => String(entry.beerDrinkId) === drinkValue) ?? null;
  const maxCount = limits.find((limit) => limit.beerDrinkId === drink?.beerDrinkId)?.maxCount ?? 1;

  return {
    personValue,
    choosePerson: touchingChangeOf(personField.field),
    personError: personField.fieldState.error?.message,
    person:
      source.candidates.find((candidate) => String(candidate.personId) === personValue) ?? null,
    drinkChoices: source.drinks.map(drinkChoiceOf),
    drinkValue: drinkValue === '' ? null : drinkValue,
    chooseDrink: touchingChangeOf(drinkField.field),
    drinkError: drinkField.fieldState.error?.message,
    drink,
    countText: countField.field.value,
    setCountText: touchingChangeOf(countField.field),
    countError: countField.fieldState.error?.message,
    count: countOfText(countField.field.value),
    maxCount,
    paid: paidField.field.value,
    setPaid: touchingChangeOf(paidField.field),
    ...writeStateOf(write),
  };
};
