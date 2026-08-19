import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import { SummaryRow } from '@/components/SummaryRow';
import { OrderPanel } from '@/features/events/components/OrderPanel';
import { orderSummaryKicker } from '@/features/events/order-confirmation-content';
import { buildOrderSummaryRows } from '@/features/events/order-confirmation-display';
import { orderSummaryTitle } from '@/features/events/order-summary-content';
import type { Order } from '@/lib/seed/orders';

interface OrderConfirmationSummaryProps {
  order: Order;
}

export const OrderConfirmationSummary: FC<OrderConfirmationSummaryProps> = ({ order }) => {
  const rows = buildOrderSummaryRows(order);

  return (
    <KkSection>
      <KkSection.Header kicker={orderSummaryKicker} title={orderSummaryTitle} />
      <OrderPanel
        tone="content"
        sx={{ gap: 0, maxWidth: { desktop: '48rem' }, bgcolor: 'background.paper' }}
      >
        {rows.map((row) => (
          <SummaryRow key={row.label} label={row.label} value={row.value} />
        ))}
      </OrderPanel>
    </KkSection>
  );
};
