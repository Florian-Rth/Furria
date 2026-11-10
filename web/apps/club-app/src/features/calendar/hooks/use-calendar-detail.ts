import { useAttendanceChoice } from '@/features/attendance/hooks/use-attendance-choice';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toAttendanceChoiceLabel } from '@/lib/calendar-copy';
import type { CalendarDetailView } from '../calendar-agenda-view';
import { toDetailView } from '../calendar-agenda-view';
import type { AttendanceRoll } from '../calendar-attendance';
import { toAttendanceRoll } from '../calendar-attendance';
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
  roll: AttendanceRoll | null;
  editLink: CalendarEntryLink | null;
  mayModerate: boolean;
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
          disabled: choice.isInert || (entry.attendance?.isClosed ?? false),
          choose: choice.choose,
        }
      : null,
    roll: entry.attendance === null ? null : toAttendanceRoll(entry.attendance),
    editLink: authoring?.linkOf(entry) ?? null,
    mayModerate: authoring?.mayOwn(entry) ?? false,
    eventLink: opensEvent
      ? { to: '/events/$eventId', params: { eventId: String(entry.calendarEntryId) } }
      : null,
  };
};
