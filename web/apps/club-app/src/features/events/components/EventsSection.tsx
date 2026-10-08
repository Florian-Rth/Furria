import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useEventsQuery } from '../api';
import { toEventsErrorMessage } from '../events-messages';
import { EventsError } from './EventsError';
import { EventsPanel } from './EventsPanel';

const LOADING_LABEL = 'Die Veranstaltungen werden geladen';

export const EventsSection: FC = () => {
  const events = useEventsQuery();
  const errorMessage = toEventsErrorMessage(events.error);

  const reload = (): void => {
    void events.refetch();
  };

  if (events.data !== undefined) {
    return <EventsPanel events={events.data.events} />;
  }
  if (errorMessage !== null) {
    return <EventsError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};
