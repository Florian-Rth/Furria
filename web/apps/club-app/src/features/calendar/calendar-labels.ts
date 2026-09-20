import type { KkFilterOption } from '@furria/ui';
import type { CalendarEntryKind } from '@/features/club';
import { toTimeSpanLabel } from '@/lib/calendar-days';
import { ALL_SCOPE_ID, CLUB_SCOPE_ID, toGroupScopeId } from './calendar-query';
import type { AttendanceAnswer, CalendarEntry, CalendarEntryVisibility } from './schemas';

export const CALENDAR_TITLE = 'Kalender';
export const CALENDAR_LOADING_LABEL = 'Der Kalender wird geladen';
export const CALENDAR_ERROR_TITLE = 'KALENDER NICHT GELADEN';
export const CALENDAR_RETRY_LABEL = 'Noch einmal';
export const CALENDAR_EMPTY_TITLE = 'NICHTS IM KALENDER';
export const CALENDAR_EMPTY_LINE =
  'In diesem Zeitraum steht kein Termin. Wähle einen anderen Bereich oder blättere weiter.';
export const CALENDAR_DAY_EMPTY_TITLE = 'AN DIESEM TAG NICHTS';
export const CALENDAR_DAY_EMPTY_LINE = 'An diesem Tag steht kein Termin.';
export const SCOPE_FILTER_LABEL = 'Nach Bereich filtern';
export const MONTH_VIEW_LABEL = 'Monat';
export const LIST_VIEW_LABEL = 'Liste';
export const PREVIOUS_MONTH_LABEL = 'Vorheriger Monat';
export const NEXT_MONTH_LABEL = 'Nächster Monat';
export const ALL_DAYS_LABEL = 'Alle Tage zeigen';
export const RUNNING_CHIP_LABEL = 'läuft gerade';

const ALL_SCOPE_LABEL = 'Alle';
const CLUB_SCOPE_LABEL = 'Verein';
const META_SEPARATOR = ' · ';
const NO_ENTRIES_LEAD = 'Gerade steht nichts im Kalender.';
const ONE_ENTRY_LEAD = 'Ein Termin steht im Kalender.';
const ONE_ENTRY = 1;

export const CALENDAR_KIND_LABELS: Record<CalendarEntryKind, string> = {
  training: 'Training',
  rehearsal: 'Probe',
  performance: 'Auftritt',
  meeting: 'Sitzung',
  party: 'Feier',
  other: 'Sonstiges',
};

export const CALENDAR_VISIBILITY_LABELS: Record<CalendarEntryVisibility, string> = {
  group: 'Gruppe',
  club: 'Verein',
  public: 'Öffentlich',
};

const ATTENDANCE_LABELS: Record<AttendanceAnswer, string> = {
  yes: 'Zusage',
  no: 'Absage',
  maybe: 'Vielleicht',
};

const ATTENDANCE_SAVED_MESSAGES: Record<AttendanceAnswer, string> = {
  yes: 'Deine Zusage ist notiert.',
  no: 'Deine Absage ist notiert.',
  maybe: 'Dein Vielleicht ist notiert.',
};

const ATTENDANCE_ORDER: readonly AttendanceAnswer[] = ['yes', 'no', 'maybe'];

export interface AttendanceChoice {
  answer: AttendanceAnswer;
  label: string;
  selected: boolean;
}

export const toAttendanceChoices = (viewerAnswer: AttendanceAnswer | null): AttendanceChoice[] =>
  ATTENDANCE_ORDER.map((answer) => ({
    answer,
    label: ATTENDANCE_LABELS[answer],
    selected: answer === viewerAnswer,
  }));

export const toAttendanceSavedMessage = (answer: AttendanceAnswer): string =>
  ATTENDANCE_SAVED_MESSAGES[answer];

export const toCalendarLead = (count: number): string => {
  if (count === 0) {
    return NO_ENTRIES_LEAD;
  }
  if (count === ONE_ENTRY) {
    return ONE_ENTRY_LEAD;
  }

  return `${count} Termine stehen im Kalender.`;
};

export const toEntryMetaLine = (entry: CalendarEntry): string => {
  const parts = [toTimeSpanLabel(entry.startsAt, entry.endsAt), CALENDAR_KIND_LABELS[entry.kind]];

  if (entry.venueName !== null) {
    parts.push(entry.venueName);
  }
  if (entry.ownerGroupName !== null) {
    parts.push(entry.ownerGroupName);
  }
  parts.push(CALENDAR_VISIBILITY_LABELS[entry.visibility]);

  return parts.join(META_SEPARATOR);
};

export const toScopeOptions = (entries: readonly CalendarEntry[]): KkFilterOption[] => {
  const clubCount = entries.filter((entry) => entry.ownerGroupId === null).length;
  const groups = new Map<number, KkFilterOption>();

  for (const entry of entries) {
    const groupId = entry.ownerGroupId;
    const groupName = entry.ownerGroupName;

    if (groupId !== null && groupName !== null) {
      const seen = groups.get(groupId);

      groups.set(groupId, {
        id: toGroupScopeId(groupId),
        label: groupName,
        count: (seen?.count ?? 0) + 1,
      });
    }
  }

  const groupOptions = [...groups.values()].sort((left, right) =>
    left.label.localeCompare(right.label, 'de'),
  );

  return [
    { id: ALL_SCOPE_ID, label: ALL_SCOPE_LABEL, count: entries.length },
    { id: CLUB_SCOPE_ID, label: CLUB_SCOPE_LABEL, count: clubCount },
    ...groupOptions,
  ];
};
