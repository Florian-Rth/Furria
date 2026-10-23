import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { EVENT_FALLBACK_TITLE } from '@/features/events/event-board-copy';

export const runningOrderOriginOf = (
  eventId: number,
  title: string | undefined,
): KkScreenOrigin => ({
  label: title ?? EVENT_FALLBACK_TITLE,
  to: '/events/$eventId',
  params: { eventId: String(eventId) },
  search: { step: 'runningOrder' },
});
