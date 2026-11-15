import type { FC } from 'react';
import { SAVE_LABEL } from '../beer-hub-copy';
import { useDrinkEditForm } from '../hooks/use-drink-form';
import type { BeerStockDrink } from '../schemas';
import { BeerDrinkFormBody } from './BeerDrinkFormBody';

interface BeerDrinkEditFormProps {
  beerPotId: number;
  drink: BeerStockDrink;
}

export const BeerDrinkEditForm: FC<BeerDrinkEditFormProps> = ({ beerPotId, drink }) => {
  const form = useDrinkEditForm(beerPotId, drink);

  return <BeerDrinkFormBody form={form} submitLabel={SAVE_LABEL} />;
};
