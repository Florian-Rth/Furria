import { KkButton } from '@furria/ui/KkButton';
import type { FC } from 'react';
import { useBeerPotSettingsMutation } from '../api';
import { useBeerHubContext } from '../beer-hub-context';
import { SAVE_LABEL } from '../beer-hub-copy';
import { usePotSettingsForm } from '../hooks/use-pot-settings-form';
import type { OpenBeerPot } from '../schemas';
import { BeerPotSettingsFields } from './BeerPotSettingsFields';

interface BeerSettingsFormProps {
  pot: OpenBeerPot;
}

export const BeerSettingsForm: FC<BeerSettingsFormProps> = ({ pot }) => {
  const hub = useBeerHubContext();
  const form = usePotSettingsForm(pot);
  const saving = useBeerPotSettingsMutation(pot.beerPotId);
  const save = (): void => {
    if (form.settings !== null) {
      saving.mutate(form.settings, { onSuccess: hub.closePane });
    }
  };

  return (
    <>
      <BeerPotSettingsFields form={form} />
      <KkButton
        variant="contained"
        size="large"
        disabled={form.settings === null || saving.isPending}
        onClick={save}
      >
        {SAVE_LABEL}
      </KkButton>
    </>
  );
};
