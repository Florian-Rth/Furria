import { KkNote, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import type { TicketRequest } from '../schemas';
import {
  groupTicketRequests,
  TICKET_REQUESTS_EMPTY_NOTE,
  TICKET_REQUESTS_PANEL_TITLE,
  toRequestsTally,
} from '../ticket-requests-labels';
import { TicketRequestEventRow } from './TicketRequestEventRow';
import { TicketRequestRow } from './TicketRequestRow';

interface TicketRequestsPanelProps {
  requests: readonly TicketRequest[];
  linksToEvents: boolean;
}

export const TicketRequestsPanel: FC<TicketRequestsPanelProps> = ({ requests, linksToEvents }) => {
  const groups = groupTicketRequests(requests);
  const meta = requests.length === 0 ? undefined : toRequestsTally(requests);

  const body =
    groups.length === 0 ? (
      <KkNote>{TICKET_REQUESTS_EMPTY_NOTE}</KkNote>
    ) : (
      groups.map((group) => (
        <KkPanel key={group.eventId} variant="list">
          <TicketRequestEventRow group={group} linksToEvent={linksToEvents} />
          {group.requests.map((request) => (
            <TicketRequestRow key={request.ticketRequestId} request={request} />
          ))}
        </KkPanel>
      ))
    );

  return (
    <KkPanelSection title={TICKET_REQUESTS_PANEL_TITLE} meta={meta}>
      {body}
    </KkPanelSection>
  );
};
