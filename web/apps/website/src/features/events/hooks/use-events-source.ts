import type { EventsSource } from '@/features/events/events-source';
import { resolveEventsSource } from '@/features/events/events-source';
import { usePublicEventsQuery } from '@/lib/public-events/api';

export const useEventsSource = (): EventsSource => {
  const { data, isError, refetch } = usePublicEventsQuery();

  const retry = (): void => {
    void refetch();
  };

  return resolveEventsSource(data, isError, retry);
};
