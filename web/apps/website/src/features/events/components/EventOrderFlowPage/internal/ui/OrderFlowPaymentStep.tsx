import type { FC } from 'react';
import { OrderPanel } from '@/features/events/components/OrderPanel';
import { orderFlowPlaceholders } from '@/features/events/order-flow-content';
import type { Event } from '@/lib/seed/events';
import type { OrderBuyer } from '@/lib/seed/orders';
import { OrderFlowStepRegions } from '../layout/OrderFlowStepRegions';
import { OrderFlowMissingBuyerNotice } from './OrderFlowMissingBuyerNotice';
import { OrderFlowPlaceholderPanel } from './OrderFlowPlaceholderPanel';
import { OrderFlowSummary } from './OrderFlowSummary';
import { OrderFlowTicketsPlaceholder } from './OrderFlowTicketsPlaceholder';
import { OrderFlowWithdrawalNotice } from './OrderFlowWithdrawalNotice';

interface OrderFlowPaymentStepProps {
  event: Event;
  buyer: OrderBuyer | null;
}

export const OrderFlowPaymentStep: FC<OrderFlowPaymentStepProps> = ({ event, buyer }) => {
  if (buyer === null) {
    return <OrderFlowMissingBuyerNotice />;
  }

  return (
    <OrderFlowStepRegions>
      <OrderFlowSummary event={event} buyer={buyer} />
      <OrderFlowTicketsPlaceholder event={event} />
      <OrderFlowWithdrawalNotice />
      <OrderPanel tone="placeholder" sx={{ gap: 1.5 }}>
        <OrderFlowPlaceholderPanel placeholder={orderFlowPlaceholders.payment} />
      </OrderPanel>
    </OrderFlowStepRegions>
  );
};
