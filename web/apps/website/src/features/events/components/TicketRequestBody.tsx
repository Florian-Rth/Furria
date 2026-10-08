import type { FC } from 'react';
import { useTicketRequestForm } from '@/features/events/hooks/use-ticket-request-form';
import type { EventDetail } from '@/lib/public-events/schemas';
import { TicketRequestClosed } from './TicketRequestClosed';
import { TicketRequestConfirmation } from './TicketRequestConfirmation';
import { TicketRequestFormSection } from './TicketRequestFormSection';

interface TicketRequestBodyProps {
  event: EventDetail;
}

export const TicketRequestBody: FC<TicketRequestBodyProps> = ({ event }) => {
  const state = useTicketRequestForm(event);

  if (state.submitted !== null) {
    return <TicketRequestConfirmation event={event} request={state.submitted} />;
  }
  if (!state.isWindowOpen) {
    return <TicketRequestClosed event={event} />;
  }

  return <TicketRequestFormSection event={event} state={state} />;
};
