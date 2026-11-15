import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { PersonRef } from '@/lib/api/schemas';
import { useOpenBeerPotMutation } from '../api';
import { EMPTY_DRINK_ROW, potFormOf } from '../beer-hub';
import { HUB_LANDING } from '../beer-landing';
import { writeStateOf } from '../form-fields';
import { BeerPotOpeningFormSchema } from '../schemas';
import { useDrinkRows } from './use-drink-rows';
import type { PotDrinksWriteForm } from './use-pot-fields';
import { usePotFields } from './use-pot-fields';

export const useOpenPotForm = (owner: PersonRef | null): PotDrinksWriteForm => {
  const opening = useOpenBeerPotMutation();
  const write = useWriteForm({
    schema: BeerPotOpeningFormSchema,
    defaults: potFormOf(owner, null, [EMPTY_DRINK_ROW]),
    mutate: (opened) =>
      opening.mutateAsync({
        ownerPersonId: opened.person.personId,
        paymentLink: opened.paymentLink,
        drinks: opened.drinks,
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
