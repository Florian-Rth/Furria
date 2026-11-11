import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { CalendarDetailView } from '../calendar-agenda-view';
import { toDetailView } from '../calendar-agenda-view';
import type { CalendarEntryLink } from '../calendar-authoring';
import type { CalendarEntry } from '../schemas';
import { useCalendarAuthoring } from './use-calendar-authoring';

export interface CalendarEventLink {
  to: '/events/$eventId';
  params: { eventId: string };
}

export interface CalendarDetail {
  view: CalendarDetailView;
  editLink: CalendarEntryLink | null;
  mayModerate: boolean;
  eventLink: CalendarEventLink | null;
}

export const useCalendarDetail = (entry: CalendarEntry): CalendarDetail => {
  const managesEvents = usePermissions().has(PERMISSION_KEYS.eventsManage);
  const { authoring } = useCalendarAuthoring();
  const opensEvent = entry.kind === 'event' && managesEvents;

  return {
    view: toDetailView(entry),
    editLink: authoring?.linkOf(entry) ?? null,
    mayModerate: authoring?.mayOwn(entry) ?? false,
    eventLink: opensEvent
      ? { to: '/events/$eventId', params: { eventId: String(entry.calendarEntryId) } }
      : null,
  };
};
