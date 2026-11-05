import type { OpenBeerPot } from '@/features/beer-list/schemas';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { useBeerPotSettingsMutation } from '../api';
import { potFormOf } from '../beer-hub';
import { HUB_LANDING } from '../beer-landing';
import { writeStateOf } from '../form-fields';
import { BeerPotSettingsFormSchema } from '../schemas';
import type { PotWriteForm } from './use-pot-fields';
import { usePotFields } from './use-pot-fields';

export const usePotSettingsForm = (pot: OpenBeerPot): PotWriteForm => {
  const saving = useBeerPotSettingsMutation(pot.beerPotId);
  const write = useWriteForm({
    schema: BeerPotSettingsFormSchema,
    defaults: potFormOf(null, pot),
    mutate: (settings) => saving.mutateAsync(settings),
    landing: () => HUB_LANDING,
  });
  const fields = usePotFields(write.form.control);

  return {
    fields,
    ...writeStateOf(write),
  };
};
