import { KkHoldButton } from '@furria/ui/KkHoldButton';
import type { FC } from 'react';
import {
  firstNameOf,
  HANDOVER_LABEL,
  HOLD_HINT,
  handoverConfirmOf,
  SUCCESSOR_LABEL,
} from '../beer-hub-copy';
import { useHandoverForm } from '../hooks/use-handover-form';
import { BeerPotPersonField } from './BeerPotPersonField';
import { BeerPotSettingsFields } from './BeerPotSettingsFields';
import { BeerRejection } from './BeerRejection';

interface BeerHandoverFormProps {
  beerPotId: number;
  stock: number;
}

export const BeerHandoverForm: FC<BeerHandoverFormProps> = ({ beerPotId, stock }) => {
  const form = useHandoverForm(beerPotId);
  const confirm = handoverConfirmOf(firstNameOf(form.fields.person), stock);

  return (
    <>
      <BeerPotPersonField label={SUCCESSOR_LABEL} fields={form.fields} />
      <BeerPotSettingsFields fields={form.fields} />
      <BeerRejection rejection={form.rejection} />
      <KkHoldButton
        label={HANDOVER_LABEL}
        hint={HOLD_HINT}
        tone="danger"
        confirm={confirm}
        disabled={!form.canSubmit}
        onCommit={form.submit}
      />
    </>
  );
};
