import { PageLayout } from '@furria/ui';
import type { FC } from 'react';
import type { EventDetail } from '@/lib/public-events/schemas';
import { TicketRequestBody } from './TicketRequestBody';

interface TicketRequestPageProps {
  event: EventDetail;
}

export const TicketRequestPage: FC<TicketRequestPageProps> = ({ event }) => (
  <PageLayout>
    <PageLayout.Body>
      <TicketRequestBody event={event} />
    </PageLayout.Body>
  </PageLayout>
);
