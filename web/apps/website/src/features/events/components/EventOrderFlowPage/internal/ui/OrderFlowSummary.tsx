import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { SummaryRow } from '@/components/SummaryRow';
import { OrderPanel } from '@/features/events/components/OrderPanel';
import { orderSummaryTitle } from '@/features/events/order-summary-content';
import { buildOrderDraftSummaryRows } from '@/features/events/order-summary-display';
import type { Event } from '@/lib/seed/events';
import type { OrderBuyer } from '@/lib/seed/orders';

interface OrderFlowSummaryProps {
  event: Event;
  buyer: OrderBuyer;
}

export const OrderFlowSummary: FC<OrderFlowSummaryProps> = ({ event, buyer }) => {
  const rows = buildOrderDraftSummaryRows(event, buyer);

  return (
    <OrderPanel tone="content" sx={{ gap: 3 }}>
      <Typography variant="h2" component="h2">
        {orderSummaryTitle}
      </Typography>
      <Stack sx={{ gap: 0 }}>
        {rows.map((row) => (
          <SummaryRow key={row.label} label={row.label} value={row.value} />
        ))}
      </Stack>
    </OrderPanel>
  );
};
