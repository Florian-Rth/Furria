import { KkButton } from '@furria/ui/KkButton';
import type { FC } from 'react';
import type { OpenBeerPot } from '@/features/beer-list/schemas';
import { SAVE_LABEL } from '../beer-hub-copy';
import { usePotSettingsForm } from '../hooks/use-pot-settings-form';
import { BeerPotSettingsFields } from './BeerPotSettingsFields';
import { BeerRejection } from './BeerRejection';

interface BeerSettingsFormProps {
  pot: OpenBeerPot;
}

export const BeerSettingsForm: FC<BeerSettingsFormProps> = ({ pot }) => {
  const form = usePotSettingsForm(pot);

  return (
    <>
      <BeerPotSettingsFields fields={form.fields} />
      <BeerRejection rejection={form.rejection} />
      <KkButton
        variant="contained"
        size="large"
        disabled={!form.canSubmit}
        loading={form.isSaving}
        onClick={form.submit}
      >
        {SAVE_LABEL}
      </KkButton>
    </>
  );
};
