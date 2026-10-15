import { selectTeaserEvents } from '@/features/landing/teaser-events';
import { publicEvents } from '@/lib/public-events/api';
import type { Event } from '@/lib/public-events/schemas';
import { readySourceData } from '@/lib/public-resource/public-source';

export const useTeaserEvents = (): Event[] | null => {
  const source = publicEvents.useSource();

  return source.status === 'error' ? null : selectTeaserEvents(readySourceData(source) ?? []);
};
