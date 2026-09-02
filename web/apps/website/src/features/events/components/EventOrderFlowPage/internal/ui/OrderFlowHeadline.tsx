import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { orderFlowHeadline } from '@/features/events/order-flow-content';

export const OrderFlowHeadline: FC = () => (
  <Typography variant="h1" component="h1" sx={{ fontSize: kkTokens.headline.compact }}>
    {orderFlowHeadline}
  </Typography>
);
