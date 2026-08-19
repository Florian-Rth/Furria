import { PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { ExchangeTeaserBand } from '@/features/events/components/ExchangeTeaserBand';
import type { Event } from '@/lib/seed/events';
import { useOrderSource } from './internal/logic/use-order-source';
import { OrderConfirmationBody } from './internal/ui/OrderConfirmationBody';

interface OrderConfirmationPageProps {
  orderCode: string;
  events: Event[];
  now: Date;
}

export const OrderConfirmationPage: FC<OrderConfirmationPageProps> = ({
  orderCode,
  events,
  now,
}) => {
  const source = useOrderSource(orderCode);
  const exchangeBand = source.status === 'ready' ? <ExchangeTeaserBand /> : null;

  return (
    <PageLayout>
      <PageLayout.Body>
        <OrderConfirmationBody source={source} events={events} now={now} />
      </PageLayout.Body>
      {exchangeBand}
    </PageLayout>
  );
};
