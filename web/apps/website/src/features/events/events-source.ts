import type { Event } from '@/lib/public-events/schemas';

export type EventsSource =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; events: Event[] };

export const resolveEventsSource = (
  events: Event[] | undefined,
  hasFailed: boolean,
  retry: () => void,
): EventsSource => {
  if (events !== undefined) {
    return { status: 'ready', events };
  }

  return hasFailed ? { status: 'error', retry } : { status: 'loading' };
};
