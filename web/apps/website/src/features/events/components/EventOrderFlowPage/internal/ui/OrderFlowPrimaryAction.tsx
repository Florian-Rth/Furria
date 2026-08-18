import Button from '@mui/material/Button';
import type { FC } from 'react';
import { TicketCtaButton } from '@/features/events/components/TicketCtaButton';
import type { OrderFlowAction } from '@/features/events/order-flow-display';
import type { OrderFlowStep } from '@/features/events/order-flow-steps';

interface OrderFlowPrimaryActionProps {
  action: OrderFlowAction;
  onAdvance: (step: OrderFlowStep) => void;
}

export const OrderFlowPrimaryAction: FC<OrderFlowPrimaryActionProps> = ({ action, onAdvance }) => {
  if (action.kind === 'link') {
    return <TicketCtaButton cta={action.cta} />;
  }

  const handleAdvance = (): void => {
    onAdvance(action.step);
  };

  return (
    <Button variant="contained" color="primary" size="large" onClick={handleAdvance}>
      {action.label}
    </Button>
  );
};
