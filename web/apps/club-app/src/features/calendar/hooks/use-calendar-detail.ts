import type { AttendanceAnswer } from '@/features/attendance';
import { useAttendanceChoice } from '@/features/attendance';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toAttendanceChoiceLabel } from '@/lib/calendar-copy';
import type { CalendarDetailView } from '../calendar-agenda-view';
import { toDetailView } from '../calendar-agenda-view';
import type { CalendarEntryLink } from '../calendar-authoring';
import type { CalendarEntry } from '../schemas';
import { useCalendarAuthoring } from './use-calendar-authoring';

export interface CalendarEventLink {
  to: '/events/$eventId';
  params: { eventId: string };
}

export interface CalendarDetailAnswer {
  label: string;
  value: AttendanceAnswer | null;
  error: string | undefined;
  disabled: boolean;
  choose: (answer: AttendanceAnswer) => void;
}

export interface CalendarDetail {
  view: CalendarDetailView;
  answer: CalendarDetailAnswer | null;
  editLink: CalendarEntryLink | null;
  eventLink: CalendarEventLink | null;
}

export const useCalendarDetail = (entry: CalendarEntry): CalendarDetail => {
  const managesEvents = usePermissions().has(PERMISSION_KEYS.eventsManage);
  const { authoring } = useCalendarAuthoring();
  const choice = useAttendanceChoice(entry);
  const opensEvent = entry.kind === 'event' && managesEvents;

  return {
    view: toDetailView(entry),
    answer: entry.asksForResponse
      ? {
          label: toAttendanceChoiceLabel(entry.title),
          value: choice.answer,
          error: choice.failureMessage,
          disabled: choice.isInert,
          choose: choice.choose,
        }
      : null,
    editLink: authoring?.linkOf(entry) ?? null,
    eventLink: opensEvent
      ? { to: '/events/$eventId', params: { eventId: String(entry.calendarEntryId) } }
      : null,
  };
};
