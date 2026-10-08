import { KkNote, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { useTicketRequestsQuery } from '../api';
import { toTicketRequestsErrorMessage } from '../events-messages';
import {
  EVENT_REQUESTS_EMPTY_NOTE,
  EVENT_REQUESTS_PANEL_TITLE,
  requestsOfEvent,
  toRequestsTally,
} from '../ticket-requests-labels';
import { TicketRequestRow } from './TicketRequestRow';

interface EventRequestsPanelProps {
  eventId: number;
}

export const EventRequestsPanel: FC<EventRequestsPanelProps> = ({ eventId }) => {
  const ticketRequests = useTicketRequestsQuery(true);
  const errorMessage = toTicketRequestsErrorMessage(ticketRequests.error);

  if (ticketRequests.data === undefined) {
    const errorNote =
      errorMessage === null ? null : (
        <KkNote tone="warning" icon="alert">
          {errorMessage}
        </KkNote>
      );

    return <KkPanelSection title={EVENT_REQUESTS_PANEL_TITLE}>{errorNote}</KkPanelSection>;
  }

  const requests = requestsOfEvent(ticketRequests.data.ticketRequests, eventId);
  const meta = requests.length === 0 ? undefined : toRequestsTally(requests);

  const body =
    requests.length === 0 ? (
      <KkNote>{EVENT_REQUESTS_EMPTY_NOTE}</KkNote>
    ) : (
      <KkPanel variant="list">
        {requests.map((request) => (
          <TicketRequestRow key={request.ticketRequestId} request={request} />
        ))}
      </KkPanel>
    );

  return (
    <KkPanelSection title={EVENT_REQUESTS_PANEL_TITLE} meta={meta}>
      {body}
    </KkPanelSection>
  );
};
