import type { GroupTone } from '@/features/groups';
import { toGroupTone } from '@/features/groups';
import { CALENDAR_KIND_LABELS } from '@/lib/calendar-copy';
import { toTimeSpanLabel } from '@/lib/calendar-days';
import { toIsoDay } from '@/lib/day';
import type { GroupCalendarEntry } from './schemas';

export const TERMINE_WINDOW_DAYS = 180;

const META_SEPARATOR = ' · ';
const WITH_PREFIX = 'mit ';
const WITH_SEPARATOR = ', ';
const CLUB_OWNER_LABEL = 'Verein';
const RUNNING_LABEL = 'läuft gerade';
const ONE_TERMIN = 1;

export interface TermineWindow {
  from: string;
  to: string;
}

export type TermineMark =
  | { kind: 'running'; label: string }
  | { kind: 'guestOfGroup'; label: string; tone: GroupTone }
  | { kind: 'guestOfClub'; label: string }
  | null;

export const toTermineWindow = (today: Date): TermineWindow => {
  const end = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + TERMINE_WINDOW_DAYS,
  );

  return { from: toIsoDay(today), to: toIsoDay(end) };
};

export const isOwnTermin = (entry: GroupCalendarEntry, groupId: number): boolean =>
  entry.ownerGroupId === groupId;

export const toTermineMark = (entry: GroupCalendarEntry, groupId: number): TermineMark => {
  if (entry.isRunning) {
    return { kind: 'running', label: RUNNING_LABEL };
  }
  if (isOwnTermin(entry, groupId)) {
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

export const toTerminMetaLine = (entry: GroupCalendarEntry, groupId: number): string => {
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

export const toTermineMeta = (count: number): string => {
  if (count === 0) {
    return 'nichts geplant';
  }
  if (count === ONE_TERMIN) {
    return '1 Termin';
  }

  return `${count} Termine`;
};
