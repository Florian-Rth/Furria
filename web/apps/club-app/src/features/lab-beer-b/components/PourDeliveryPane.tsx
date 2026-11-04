import { KkButton } from '@furria/ui/KkButton';
import { KkNumberField } from '@furria/ui/KkNumberField';
import type { FC, ReactNode } from 'react';
import type { PourHub } from '../hooks/use-pour-hub';
import { usePourStockForm } from '../hooks/use-pour-stock-form';
import { COUNT_FIELD_LABEL, deliveryButtonOf, STEP_LABELS, stockAfterOf } from '../pour-hub-copy';
import { PourFormFrame } from './PourFormFrame';

const DEFAULT_DELIVERY = '25';

interface PourDeliveryPaneProps {
  hub: PourHub;
  framed: boolean;
  actions: ReactNode;
}

export const PourDeliveryPane: FC<PourDeliveryPaneProps> = ({ hub, framed, actions }) => {
  const form = usePourStockForm(DEFAULT_DELIVERY);
  const hint = stockAfterOf(hub.summary.stock, form.count);
  const buttonLabel = deliveryButtonOf(form.count);
  const book = (): void => {
    if (hub.delivery(form.count)) {
      hub.closeSide();
    }
  };

  return (
    <PourFormFrame form="delivery" framed={framed} actions={actions} refusal={hub.refusal}>
      <KkNumberField
        name="delivery"
        label={COUNT_FIELD_LABEL}
        value={form.countText}
        onChange={form.setCountText}
        stepLabels={STEP_LABELS}
        min={1}
        hint={hint}
      />
      <KkButton variant="contained" size="large" disabled={form.count === 0} onClick={book}>
        {buttonLabel}
      </KkButton>
    </PourFormFrame>
  );
};
