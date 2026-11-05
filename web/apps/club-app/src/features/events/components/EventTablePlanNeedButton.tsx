import { KkButton } from '@furria/ui/KkButton';
import type { FC } from 'react';
import { useTablePlanNeedMutation } from '@/features/hall-plan/api';
import type { TablePlanNeedOffer } from '../hall-step';
import { NEED_OFFER_LABELS } from '../hall-step-copy';

interface EventTablePlanNeedButtonProps {
  eventId: number;
  offer: Exclude<TablePlanNeedOffer, null>;
}

export const EventTablePlanNeedButton: FC<EventTablePlanNeedButtonProps> = ({ eventId, offer }) => {
  const need = useTablePlanNeedMutation(eventId);
  const toggle = (): void => {
    need.mutate(offer === 'restore');
  };

  return (
    <KkButton size="small" variant="text" onClick={toggle} loading={need.isPending}>
      {NEED_OFFER_LABELS[offer]}
    </KkButton>
  );
};
