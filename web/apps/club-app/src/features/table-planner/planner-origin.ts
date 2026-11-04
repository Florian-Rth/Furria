import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { EVENT_FALLBACK_TITLE } from '@/features/events/event-board-copy';
import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export const TABLE_PLANNER_PERMISSION_KEYS: readonly PermissionKey[] = [
  PERMISSION_KEYS.eventsHall,
  PERMISSION_KEYS.eventsManage,
];

export const tablePlannerOriginOf = (
  eventId: number,
  title: string | undefined,
): KkScreenOrigin => ({
  label: title ?? EVENT_FALLBACK_TITLE,
  to: '/events/$eventId',
  params: { eventId: String(eventId) },
  search: { step: 'hall' },
});
