import type { GroupTone } from '@/features/groups';
import { toGroupTone } from '@/features/groups';
import { CALENDAR_KIND_LABELS } from '@/lib/calendar-copy';
import { toTimeSpanLabel } from '@/lib/calendar-days';
import { toIsoDay } from '@/lib/day';
import type { GroupCalendarEntry } from './schemas';

export const CALENDAR_ENTRY_WINDOW_DAYS = 180;

const META_SEPARATOR = ' · ';
const WITH_PREFIX = 'mit ';
const WITH_SEPARATOR = ', ';
const CLUB_OWNER_LABEL = 'Verein';
const RUNNING_LABEL = 'läuft gerade';
const ONE_CALENDAR_ENTRY = 1;

export interface CalendarEntryWindow {
  from: string;
  to: string;
}

export type CalendarEntryMark =
  | { kind: 'running'; label: string }
  | { kind: 'guestOfGroup'; label: string; tone: GroupTone }
  | { kind: 'guestOfClub'; label: string }
  | null;

export const toCalendarEntryWindow = (today: Date): CalendarEntryWindow => {
  const end = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + CALENDAR_ENTRY_WINDOW_DAYS,
  );

  return { from: toIsoDay(today), to: toIsoDay(end) };
};

export const isOwnCalendarEntry = (entry: GroupCalendarEntry, groupId: number): boolean =>
  entry.ownerGroupId === groupId;

export const toCalendarEntryMark = (
  entry: GroupCalendarEntry,
  groupId: number,
): CalendarEntryMark => {
  if (entry.isRunning) {
    return { kind: 'running', label: RUNNING_LABEL };
  }
  if (isOwnCalendarEntry(entry, groupId)) {
    return null;
  }
  if (entry.ownerGroupId === null || entry.ownerGroupName === null) {
    return { kind: 'guestOfClub', label: CLUB_OWNER_LABEL };
  }

  return {
    kind: 'guestOfGroup',
    label: entry.ownerGroupName,
    tone: toGroupTone(entry.ownerGroupId, entry.ownerGroupTone),
  };
};

export const toCalendarEntryMetaLine = (entry: GroupCalendarEntry, groupId: number): string => {
  const parts = [toTimeSpanLabel(entry.startsAt, entry.endsAt), CALENDAR_KIND_LABELS[entry.kind]];

  if (entry.venueName !== null) {
    parts.push(entry.venueName);
  }

  const alongside = entry.participatingGroups
    .filter((group) => group.groupId !== groupId)
    .map((group) => group.name);

  if (alongside.length > 0) {
    parts.push(`${WITH_PREFIX}${alongside.join(WITH_SEPARATOR)}`);
  }

  return parts.join(META_SEPARATOR);
};

export const toCalendarEntryMeta = (count: number): string => {
  if (count === 0) {
    return 'nichts geplant';
  }
  if (count === ONE_CALENDAR_ENTRY) {
    return '1 Termin';
  }

  return `${count} Termine`;
};
