import type { ChangeEvent } from 'react';
import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { useBeerDrinkAddMutation, useBeerDrinkChangeMutation } from '../api';
import { priceTextOf } from '../beer-hub';
import { DRINKS_LANDING } from '../beer-landing';
import type { BeerWriteState } from '../form-fields';
import { touchingChangeOf, writeStateOf } from '../form-fields';
import type { BeerDrinkForm, BeerNewDrink, BeerStockDrink } from '../schemas';
import { BeerDrinkFormSchema } from '../schemas';

type TextChange = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

export interface DrinkForm extends BeerWriteState {
  name: string;
  changeName: (event: TextChange) => void;
  touchName: () => void;
  nameError: string | undefined;
  priceText: string;
  setPriceText: (text: string) => void;
  priceError: string | undefined;
}

const EMPTY_DRINK: BeerDrinkForm = { name: '', price: '' };

const useDrinkForm = <TResult>(
  defaults: BeerDrinkForm,
  save: (drink: BeerNewDrink) => Promise<TResult>,
): DrinkForm => {
  const write = useWriteForm({
    schema: BeerDrinkFormSchema,
    defaults,
    mutate: save,
    landing: () => DRINKS_LANDING,
    onLanded: () => {
      write.form.reset(defaults);
    },
  });
  const nameField = useController({ control: write.form.control, name: 'name' });
  const priceField = useController({ control: write.form.control, name: 'price' });

  return {
    name: nameField.field.value,
    changeName: (event) => {
      nameField.field.onChange(event.target.value);
    },
    touchName: nameField.field.onBlur,
    nameError: nameField.fieldState.error?.message,
    priceText: priceField.field.value,
    setPriceText: touchingChangeOf(priceField.field),
    priceError: priceField.fieldState.error?.message,
    ...writeStateOf(write),
  };
};

export const useDrinkAddForm = (beerPotId: number): DrinkForm => {
  const adding = useBeerDrinkAddMutation(beerPotId);

  return useDrinkForm(EMPTY_DRINK, adding.mutateAsync);
};

export const useDrinkEditForm = (beerPotId: number, drink: BeerStockDrink): DrinkForm => {
  const changing = useBeerDrinkChangeMutation(beerPotId, drink.beerDrinkId);

  return useDrinkForm(
    { name: drink.name, price: priceTextOf(drink.cratePriceCents) },
    changing.mutateAsync,
  );
};
