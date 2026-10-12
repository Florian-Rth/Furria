import { useAttendanceChoice } from '@/features/attendance';
import type { EntrySheetView } from '@/features/entry-sheet';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toAttendanceChoiceLabel } from '@/lib/calendar-copy';
import { usePeek } from '@/lib/use-peek';
import { opensEntrySheet } from '../calendar-authoring';
import { toCalendarEntrySheet } from '../calendar-entry-sheet';
import type { CalendarEntry } from '../schemas';

const toEntryId = (entry: CalendarEntry): number => entry.calendarEntryId;

export const useCalendarEntryPeek = (entries: readonly CalendarEntry[]): CalendarEntry | null =>
  usePeek('entry', entries.filter(opensEntrySheet), toEntryId);

export const useCalendarEntrySheet = (entry: CalendarEntry): EntrySheetView => {
  const managesEvents = usePermissions().has(PERMISSION_KEYS.eventsManage);
  const choice = useAttendanceChoice(entry);
  const answer = entry.asksForResponse
    ? {
        label: toAttendanceChoiceLabel(entry.title),
        value: choice.answer,
        choose: choice.choose,
        error: choice.failureMessage,
        disabled: choice.isInert,
      }
    : null;

  return toCalendarEntrySheet(entry, managesEvents, answer);
};
