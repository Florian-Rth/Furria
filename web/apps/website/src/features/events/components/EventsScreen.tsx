import type { FC } from 'react';
import { EventListPage } from '@/features/events/components/EventListPage/EventListPage';
import { EventsLoading } from '@/features/events/components/EventsLoading';
import { EventsUnavailable } from '@/features/events/components/EventsUnavailable';
import { useEventsSource } from '@/features/events/hooks/use-events-source';

interface EventsScreenProps {
  now: Date;
}

export const EventsScreen: FC<EventsScreenProps> = ({ now }) => {
  const source = useEventsSource();

  if (source.status === 'loading') {
    return <EventsLoading />;
  }

  if (source.status === 'error') {
    return <EventsUnavailable onRetry={source.retry} />;
  }

  return <EventListPage events={source.events} now={now} />;
};
