import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useTicketRequestsQuery } from '../api';
import { toTicketRequestsErrorMessage } from '../events-messages';
import { TicketRequestsError } from './TicketRequestsError';
import { TicketRequestsPanel } from './TicketRequestsPanel';
import { TicketRequestToDos } from './TicketRequestToDos';

const LOADING_LABEL = 'Die Kartenanfragen werden geladen';

interface TicketRequestsSectionProps {
  linksToEvents: boolean;
}

export const TicketRequestsSection: FC<TicketRequestsSectionProps> = ({ linksToEvents }) => {
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
        <TicketRequestsPanel requests={requests} linksToEvents={linksToEvents} />
      </>
    );
  }
  if (errorMessage !== null) {
    return <TicketRequestsError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};
