import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { useBeerHandoverMutation } from '../api';
import { potFormOf, priceRowOf } from '../beer-hub';
import { HUB_LANDING } from '../beer-landing';
import { writeStateOf } from '../form-fields';
import type { BeerStockDrink } from '../schemas';
import { BeerHandoverFormSchema } from '../schemas';
import { useDrinkRows } from './use-drink-rows';
import type { PotDrinksWriteForm } from './use-pot-fields';
import { usePotFields } from './use-pot-fields';

export const useHandoverForm = (
  beerPotId: number,
  carried: readonly BeerStockDrink[],
): PotDrinksWriteForm => {
  const handingOver = useBeerHandoverMutation();
  const write = useWriteForm({
    schema: BeerHandoverFormSchema,
    defaults: potFormOf(null, null, carried.map(priceRowOf)),
    mutate: (handover) =>
      handingOver.mutateAsync({
        beerPotId,
        successorPersonId: handover.person.personId,
        paymentLink: handover.paymentLink,
        drinks: handover.drinks,
      }),
    landing: () => HUB_LANDING,
  });
  const fields = usePotFields(write.form.control);
  const drinks = useDrinkRows(write);

  return {
    fields,
    drinks,
    ...writeStateOf(write),
  };
};
