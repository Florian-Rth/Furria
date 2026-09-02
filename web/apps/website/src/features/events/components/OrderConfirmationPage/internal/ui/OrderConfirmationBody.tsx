import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import { isDemoOrder } from '@/features/events/order-confirmation-display';
import type { Event } from '@/lib/seed/events';
import type { OrderSource } from '../logic/use-order-source';
import { OrderConfirmationError } from './OrderConfirmationError';
import { OrderConfirmationLoading } from './OrderConfirmationLoading';
import { OrderConfirmationSummary } from './OrderConfirmationSummary';
import { OrderCrossSell } from './OrderCrossSell';
import { OrderDemoNotice } from './OrderDemoNotice';
import { OrderStateHero } from './OrderStateHero';

interface OrderConfirmationBodyProps {
  source: OrderSource;
  events: Event[];
  now: Date;
}

export const OrderConfirmationBody: FC<OrderConfirmationBodyProps> = ({ source, events, now }) => {
  if (source.status === 'loading') {
    return <OrderConfirmationLoading />;
  }

  if (source.status === 'error') {
    return <OrderConfirmationError />;
  }

  const demoNotice = isDemoOrder(source.order) ? <OrderDemoNotice /> : null;

  return (
    <>
      <KkSection>
        {demoNotice}
        <OrderStateHero order={source.order} />
      </KkSection>
      <OrderConfirmationSummary order={source.order} />
      <OrderCrossSell order={source.order} events={events} now={now} />
    </>
  );
};
