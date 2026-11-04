import { KkHoldButton } from '@furria/ui/KkHoldButton';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub/components/PersonPicker';
import { useBeerHubContext } from '../beer-hub-context';
import {
  firstNameOf,
  HANDOVER_LABEL,
  HANDOVER_LEAD,
  HOLD_HINT,
  handoverConfirmOf,
  SUCCESSOR_LABEL,
} from '../beer-hub-copy';
import { useHandoverForm } from '../hooks/use-handover-form';
import { BeerPotSettingsFields } from './BeerPotSettingsFields';

interface BeerHandoverFormProps {
  beerPotId: number;
  stock: number;
}

export const BeerHandoverForm: FC<BeerHandoverFormProps> = ({ beerPotId, stock }) => {
  const hub = useBeerHubContext();
  const form = useHandoverForm(beerPotId, hub.closePane);
  const confirm = handoverConfirmOf(firstNameOf(form.successor), stock);

  return (
    <>
      <KkText variant="body2" tone="secondary">
        {HANDOVER_LEAD}
      </KkText>
      <KkText variant="subtitle2">{SUCCESSOR_LABEL}</KkText>
      <PersonPicker
        selected={form.successor}
        onSelect={form.chooseSuccessor}
        onClear={form.clearSuccessor}
      />
      <BeerPotSettingsFields form={form.settings} />
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
