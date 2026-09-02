import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { OrderPanel } from '@/features/events/components/OrderPanel';
import { orderFlowPlaceholders } from '@/features/events/order-flow-content';
import { deriveOrderFlowPriceLine } from '@/features/events/order-flow-display';
import type { Event } from '@/lib/seed/events';
import { OrderFlowPlaceholderPanel } from './OrderFlowPlaceholderPanel';

interface OrderFlowTicketsPlaceholderProps {
  event: Event;
}

export const OrderFlowTicketsPlaceholder: FC<OrderFlowTicketsPlaceholderProps> = ({ event }) => {
  const priceLine = deriveOrderFlowPriceLine(event);
  const price =
    priceLine === null ? null : (
      <Typography variant="subtitle1" component="p" sx={{ fontWeight: 800 }}>
        {priceLine}
      </Typography>
    );

  return (
    <OrderPanel tone="placeholder" sx={{ gap: 1.5 }}>
      <OrderFlowPlaceholderPanel placeholder={orderFlowPlaceholders.tickets} />
      {price}
    </OrderPanel>
  );
};
