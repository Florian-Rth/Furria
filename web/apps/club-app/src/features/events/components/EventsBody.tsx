import type { FC } from 'react';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { deniedMessageOf } from '@/features/session/permission-denials';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { LOADING_LABEL } from '../event-board-copy';
import { useEventsWorkbench } from '../hooks/use-events-workbench';
import { EventsBoardBody } from './EventsBoardBody';

export const EventsBody: FC = () => {
  const workbench = useEventsWorkbench();

  if (workbench.isUndecided) {
    return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
  }
  if (workbench.managesEvents) {
    return <EventsBoardBody />;
  }

  return <AccessDenied message={deniedMessageOf(PERMISSION_KEYS.eventsManage)} />;
};
