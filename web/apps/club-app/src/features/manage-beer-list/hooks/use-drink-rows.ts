import type { ChangeEvent } from 'react';
import { useFieldArray } from 'react-hook-form';
import type { WriteFormControl } from '@/features/write/hooks/use-write-form';
import { EMPTY_DRINK_ROW, MAX_DRINKS } from '../beer-hub';
import type { BeerPotForm } from '../schemas';

type TextChange = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

const FIELD_EDIT = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const;

export interface DrinkRowField {
  key: string;
  beerDrinkId: number | null;
  name: string;
  nameError: string | undefined;
  changeName: (event: TextChange) => void;
  priceText: string;
  priceError: string | undefined;
  setPriceText: (text: string) => void;
  isDefault: boolean;
  canRemove: boolean;
  remove: () => void;
}

export interface DrinkRows {
  rows: readonly DrinkRowField[];
  canAdd: boolean;
  add: () => void;
}

export const useDrinkRows = <TSubmitted>(
  write: WriteFormControl<BeerPotForm, TSubmitted>,
): DrinkRows => {
  const { form, values } = write;
  const drinks = useFieldArray({ control: form.control, name: 'drinks' });
  const rowErrors = form.formState.errors.drinks;
  const canRemove = drinks.fields.length > 1;

  const rows = drinks.fields.map((field, index): DrinkRowField => {
    const row = values.drinks[index] ?? field;
    const errors = rowErrors?.[index];

    return {
      key: field.id,
      beerDrinkId: row.beerDrinkId,
      name: row.name,
      nameError: errors?.name?.message,
      changeName: (event) => {
        form.setValue(`drinks.${index}.name`, event.target.value, FIELD_EDIT);
      },
      priceText: row.price,
      priceError: errors?.price?.message,
      setPriceText: (text) => {
        form.setValue(`drinks.${index}.price`, text, FIELD_EDIT);
      },
      isDefault: index === 0,
      canRemove,
      remove: () => {
        drinks.remove(index);
      },
    };
  });

  return {
    rows,
    canAdd: drinks.fields.length < MAX_DRINKS,
    add: () => {
      drinks.append({ ...EMPTY_DRINK_ROW });
    },
  };
};
