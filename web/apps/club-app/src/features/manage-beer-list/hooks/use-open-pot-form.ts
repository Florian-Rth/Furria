import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { PersonRef } from '@/lib/api/schemas';
import { useOpenBeerPotMutation } from '../api';
import { potFormOf } from '../beer-hub';
import { HUB_LANDING } from '../beer-landing';
import { writeStateOf } from '../form-fields';
import { BeerPotOpeningFormSchema } from '../schemas';
import type { PotWriteForm } from './use-pot-fields';
import { usePotFields } from './use-pot-fields';

export const useOpenPotForm = (owner: PersonRef | null): PotWriteForm => {
  const opening = useOpenBeerPotMutation();
  const write = useWriteForm({
    schema: BeerPotOpeningFormSchema,
    defaults: potFormOf(owner, null),
    mutate: (opened) =>
      opening.mutateAsync({ ownerPersonId: opened.person.personId, settings: opened.settings }),
    landing: () => HUB_LANDING,
  });
  const fields = usePotFields(write.form.control);

  return {
    fields,
    ...writeStateOf(write),
  };
};
