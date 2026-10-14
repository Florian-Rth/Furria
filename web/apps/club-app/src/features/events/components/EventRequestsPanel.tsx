import { KkNote, KkPanel, KkPanelSection, KkRetryAlert, KkSkeletonRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useTicketRequestsQuery } from '../api';
import { toTicketRequestsErrorMessage } from '../events-messages';
import {
  EVENT_REQUESTS_EMPTY_NOTE,
  EVENT_REQUESTS_LOADING_LABEL,
  EVENT_REQUESTS_PANEL_TITLE,
  EVENT_REQUESTS_RETRY_LABEL,
  requestsOfEvent,
  toRequestsTally,
} from '../ticket-requests-labels';
import { TicketRequestRow } from './TicketRequestRow';

const SKELETON_ROWS = 2;

interface EventRequestsPanelProps {
  eventId: number;
}

export const EventRequestsPanel: FC<EventRequestsPanelProps> = ({ eventId }) => {
  const ticketRequests = useTicketRequestsQuery(true);
  const errorMessage = toTicketRequestsErrorMessage(ticketRequests.error);

  const reload = (): void => {
    void ticketRequests.refetch();
  };

  if (ticketRequests.data === undefined) {
    const placeholder =
      errorMessage === null ? (
        <Stack role="status" aria-label={EVENT_REQUESTS_LOADING_LABEL}>
          <KkSkeletonRow count={SKELETON_ROWS} />
        </Stack>
      ) : (
        <KkRetryAlert
          message={errorMessage}
          retrying={ticketRequests.isFetching}
          onRetry={reload}
          retryLabel={EVENT_REQUESTS_RETRY_LABEL}
        />
      );

    return <KkPanelSection title={EVENT_REQUESTS_PANEL_TITLE}>{placeholder}</KkPanelSection>;
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
