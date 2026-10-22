import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { useTicketRequestsQuery } from '../api';
import { toTicketRequestsErrorMessage } from '../events-messages';
import { TicketRequestsError } from './TicketRequestsError';
import { TicketRequestsPanel } from './TicketRequestsPanel';
import { TicketRequestToDos } from './TicketRequestToDos';

const LOADING_LABEL = 'Die Kartenanfragen werden geladen';

export const TicketRequestsSection: FC = () => {
  const ticketRequests = useTicketRequestsQuery(true);
  const errorMessage = toTicketRequestsErrorMessage(ticketRequests.error);

  const reload = (): void => {
    void ticketRequests.refetch();
  };

  if (ticketRequests.data !== undefined) {
    const { toDo, ticketRequests: requests } = ticketRequests.data;
    const toDos = toDo === null ? null : <TicketRequestToDos toDo={toDo} />;

    return (
      <>
        {toDos}
        <TicketRequestsPanel requests={requests} />
      </>
    );
  }
  if (errorMessage !== null) {
    return (
      <TicketRequestsError
        message={errorMessage}
        isRetrying={ticketRequests.isFetching}
        onRetry={reload}
      />
    );
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};
