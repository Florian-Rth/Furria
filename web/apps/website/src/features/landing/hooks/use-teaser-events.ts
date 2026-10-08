import { selectTeaserEvents } from '@/features/landing/teaser-events';
import { usePublicEventsQuery } from '@/lib/public-events/api';
import type { Event } from '@/lib/public-events/schemas';

export const useTeaserEvents = (): Event[] => {
  const { data } = usePublicEventsQuery();

  return selectTeaserEvents(data ?? []);
};
