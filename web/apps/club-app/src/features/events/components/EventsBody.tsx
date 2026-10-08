import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied, AppListSkeleton, deniedMessageOf } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useEventsWorkbench } from '../hooks/use-events-workbench';
import { EventsSection } from './EventsSection';
import { TicketRequestsSection } from './TicketRequestsSection';

const LOADING_LABEL = 'Die Veranstaltungen werden geladen';

export const EventsBody: FC = () => {
  const workbench = useEventsWorkbench();

  if (workbench.isUndecided) {
    return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
  }
  if (!workbench.managesEvents && !workbench.handlesRequests) {
    return <AccessDenied message={deniedMessageOf(PERMISSION_KEYS.eventsManage)} />;
  }

  const ticketRequests = workbench.handlesRequests ? (
    <TicketRequestsSection linksToEvents={workbench.managesEvents} />
  ) : null;
  const events = workbench.managesEvents ? <EventsSection /> : null;

  return (
    <KkPanelStack>
      {ticketRequests}
      {events}
    </KkPanelStack>
  );
};
