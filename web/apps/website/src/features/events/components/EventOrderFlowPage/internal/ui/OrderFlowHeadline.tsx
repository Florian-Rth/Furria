import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { orderFlowHeadline } from '@/features/events/order-flow-content';

export const OrderFlowHeadline: FC = () => (
  <Typography variant="display" component="h1">
    {orderFlowHeadline}
  </Typography>
);
