import type { FC } from 'react';
import { ADD_DRINK_LABEL } from '../beer-hub-copy';
import { useDrinkAddForm } from '../hooks/use-drink-form';
import { BeerDrinkFormBody } from './BeerDrinkFormBody';

interface BeerDrinkAddFormProps {
  beerPotId: number;
}

export const BeerDrinkAddForm: FC<BeerDrinkAddFormProps> = ({ beerPotId }) => {
  const form = useDrinkAddForm(beerPotId);

  return <BeerDrinkFormBody form={form} submitLabel={ADD_DRINK_LABEL} />;
};
