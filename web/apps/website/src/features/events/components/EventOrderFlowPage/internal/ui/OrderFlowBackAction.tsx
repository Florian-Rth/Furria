import Button from '@mui/material/Button';
import type { FC } from 'react';
import { orderFlowBackActionLabel } from '@/features/events/order-flow-content';

interface OrderFlowBackActionProps {
  onBack: () => void;
}

export const OrderFlowBackAction: FC<OrderFlowBackActionProps> = ({ onBack }) => (
  <Button variant="text" color="primary" size="large" onClick={onBack}>
    {orderFlowBackActionLabel}
  </Button>
);
