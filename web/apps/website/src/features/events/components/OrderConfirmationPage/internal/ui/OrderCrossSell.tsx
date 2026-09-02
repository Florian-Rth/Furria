import { KkNote, KkSection } from '@furria/ui';
import type { FC } from 'react';
import { orderCrossSellContent } from '@/features/events/order-confirmation-content';
import { selectOrderCrossSellEvent } from '@/features/events/order-confirmation-display';
import type { Event } from '@/lib/seed/events';
import type { Order } from '@/lib/seed/orders';
import { OrderCrossSellBlock } from '../layout/OrderCrossSellBlock';
import { OrderCrossSellCard } from './OrderCrossSellCard';

interface OrderCrossSellProps {
  order: Order;
  events: Event[];
  now: Date;
}

export const OrderCrossSell: FC<OrderCrossSellProps> = ({ order, events, now }) => {
  const crossSell = selectOrderCrossSellEvent(events, order, now);
  if (crossSell === null) {
    return null;
  }

  return (
    <KkSection>
      <KkSection.Header kicker={orderCrossSellContent.kicker} title={orderCrossSellContent.title} />
      <OrderCrossSellBlock>
        <KkNote>{orderCrossSellContent.note}</KkNote>
        <OrderCrossSellCard event={crossSell} />
      </OrderCrossSellBlock>
    </KkSection>
  );
};
