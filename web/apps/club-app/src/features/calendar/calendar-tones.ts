import type { KkGroupTone } from '@furria/ui';
import { toGroupTone } from '@/features/groups';
import type { CalendarInstant, CalendarMark } from '@/lib/calendar-days';

export interface CalendarOwnership {
  ownerGroupId: number | null;
  ownerGroupTone: KkGroupTone | null;
}

export const toEntryTone = (entry: CalendarOwnership): KkGroupTone | null => {
  if (entry.ownerGroupId === null) {
    return null;
  }

  return toGroupTone(entry.ownerGroupId, entry.ownerGroupTone);
};

export const toCalendarMarks = (
  entries: readonly (CalendarInstant & CalendarOwnership)[],
): CalendarMark[] =>
  entries.map((entry) => ({ startsAt: entry.startsAt, tone: toEntryTone(entry) }));
