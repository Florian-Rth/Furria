import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { deriveOrderFlowHeadline } from '@/features/events/order-flow-display';
import type { Event } from '@/lib/seed/events';

interface OrderFlowHeadlineProps {
  event: Event;
}

export const OrderFlowHeadline: FC<OrderFlowHeadlineProps> = ({ event }) => {
  const headline = deriveOrderFlowHeadline(event);

  return (
    <Typography
      variant="h1"
      component="h1"
      sx={{ textTransform: 'uppercase', fontSize: kkTokens.headline.compact }}
    >
      {headline}
    </Typography>
  );
};
