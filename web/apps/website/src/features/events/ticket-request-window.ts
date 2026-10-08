import { parseBerlinDateTime } from '@/lib/date';
import type { Event, SalesStatus } from '@/lib/public-events/schemas';

const REQUESTABLE_STATUSES: ReadonlySet<SalesStatus> = new Set(['available', 'fewLeft']);

export const isTicketRequestWindowOpen = (
  event: Pick<Event, 'status' | 'startsAt'>,
  now: Date,
): boolean =>
  REQUESTABLE_STATUSES.has(event.status) &&
  parseBerlinDateTime(event.startsAt).getTime() > now.getTime();
