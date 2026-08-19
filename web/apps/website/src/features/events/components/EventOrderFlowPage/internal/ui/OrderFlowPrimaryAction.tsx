import Button from '@mui/material/Button';
import type { FC } from 'react';
import type { OrderFlowAction } from '@/features/events/order-flow-display';
import type { OrderFlowStep } from '@/features/events/order-flow-steps';

interface OrderFlowPrimaryActionProps {
  action: OrderFlowAction;
  onAdvance: (step: OrderFlowStep) => void;
  onSubmit: () => void;
}

export const OrderFlowPrimaryAction: FC<OrderFlowPrimaryActionProps> = ({
  action,
  onAdvance,
  onSubmit,
}) => {
  if (action.kind === 'pending') {
    return (
      <Button variant="contained" color="primary" size="large" disabled>
        {action.label}
      </Button>
    );
  }

  const handleClick = (): void => {
    if (action.kind === 'submit') {
      onSubmit();
      return;
    }
    onAdvance(action.step);
  };

  return (
    <Button variant="contained" color="primary" size="large" onClick={handleClick}>
      {action.label}
    </Button>
  );
};
