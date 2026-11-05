import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { useBeerHandoverMutation } from '../api';
import { potFormOf } from '../beer-hub';
import { HUB_LANDING } from '../beer-landing';
import { writeStateOf } from '../form-fields';
import { BeerHandoverFormSchema } from '../schemas';
import type { PotWriteForm } from './use-pot-fields';
import { usePotFields } from './use-pot-fields';

export const useHandoverForm = (beerPotId: number): PotWriteForm => {
  const handingOver = useBeerHandoverMutation();
  const write = useWriteForm({
    schema: BeerHandoverFormSchema,
    defaults: potFormOf(null, null),
    mutate: (handover) =>
      handingOver.mutateAsync({
        beerPotId,
        successorPersonId: handover.person.personId,
        settings: handover.settings,
      }),
    landing: () => HUB_LANDING,
  });
  const fields = usePotFields(write.form.control);

  return {
    fields,
    ...writeStateOf(write),
  };
};
