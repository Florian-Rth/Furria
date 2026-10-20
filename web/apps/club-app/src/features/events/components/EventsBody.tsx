import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied, AppListSkeleton, deniedMessageOf } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { LOADING_LABEL } from '../event-board-copy';
import { useEventsWorkbench } from '../hooks/use-events-workbench';
import { EventsBoardBody } from './EventsBoardBody';
import { TicketRequestsSection } from './TicketRequestsSection';

export const EventsBody: FC = () => {
  const workbench = useEventsWorkbench();

  if (workbench.isUndecided) {
    return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
  }
  if (workbench.managesEvents) {
    return <EventsBoardBody />;
  }
  if (workbench.handlesRequests) {
    return (
      <KkPanelStack>
        <TicketRequestsSection />
      </KkPanelStack>
    );
  }

  return <AccessDenied message={deniedMessageOf(PERMISSION_KEYS.eventsManage)} />;
};
