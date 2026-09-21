import type { KkConfirmFact, KkFilterOption, KkSelectOption } from '@furria/ui';
import type { AttendanceChoice } from '@/lib/calendar-copy';
import {
  CALENDAR_KIND_LABELS,
  toAttendanceChoices,
  toAttendanceSavedMessage,
} from '@/lib/calendar-copy';
import { toIsoDayLabel, toLocalIsoDay, toTimeSpanLabel } from '@/lib/calendar-days';
import type { CalendarOwnerOption } from './calendar-authoring';
import { NO_VENUE_ID, toTimeChoices } from './calendar-authoring';
import { ALL_SCOPE_ID, CLUB_SCOPE_ID, toGroupScopeId } from './calendar-query';
import type { CalendarEntry, CalendarEntryVisibility, RunningVenue } from './schemas';

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
const ONE_ENTRY_LABEL = 'Ein Termin';
const MANY_ENTRIES_LABEL = 'Termine';

export type { AttendanceChoice };
export { CALENDAR_KIND_LABELS, toAttendanceChoices, toAttendanceSavedMessage };

const CLUB_OWNER_LABEL = 'Verein';
const CLUB_REACH_LABEL = 'für alle im Verein';
const PUBLIC_REACH_LABEL = 'öffentlich';

const toReachLabel = (
  visibility: CalendarEntryVisibility,
  ownerGroupName: string | null,
): string | null => {
  if (visibility === 'public') {
    return PUBLIC_REACH_LABEL;
  }
  if (visibility === 'club' && ownerGroupName !== null) {
    return CLUB_REACH_LABEL;
  }

  return null;
};

export const toCalendarLead = (count: number): string => {
  if (count === 0) {
    return NO_ENTRIES_LEAD;
  }
  if (count === ONE_ENTRY) {
    return ONE_ENTRY_LEAD;
  }

  return `${count} Termine stehen im Kalender.`;
};

export const toDayEntriesLabel = (count: number): string => {
  if (count === ONE_ENTRY) {
    return ONE_ENTRY_LABEL;
  }

  return `${count} ${MANY_ENTRIES_LABEL}`;
};

export const toEntryMetaLine = (entry: CalendarEntry): string => {
  const parts = [toTimeSpanLabel(entry.startsAt, entry.endsAt), CALENDAR_KIND_LABELS[entry.kind]];

  if (entry.venueName !== null) {
    parts.push(entry.venueName);
  }
  parts.push(entry.ownerGroupName ?? CLUB_OWNER_LABEL);

  const reachLabel = toReachLabel(entry.visibility, entry.ownerGroupName);

  if (reachLabel !== null) {
    parts.push(reachLabel);
  }

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

export const CREATE_ENTRY_LABEL = 'Termin eintragen';
export const EDIT_ENTRY_LABEL = 'Bearbeiten';
export const DELETE_ENTRY_LABEL = 'Löschen';

const CALENDAR_VISIBILITY_LABELS: Record<CalendarEntryVisibility, string> = {
  group: 'Gruppenintern',
  club: 'Verein',
  public: 'Öffentlich',
};

const NO_VENUE_LABEL = 'Kein Ort';
export const CALENDAR_KIND_OPTIONS: readonly KkSelectOption[] = (
  ['training', 'rehearsal', 'performance', 'meeting', 'party', 'other'] as const
).map((kind) => ({ value: kind, label: CALENDAR_KIND_LABELS[kind] }));

export const CALENDAR_VISIBILITY_OPTIONS: readonly KkSelectOption[] = (
  ['group', 'club', 'public'] as const
).map((visibility) => ({
  value: visibility,
  label: CALENDAR_VISIBILITY_LABELS[visibility],
}));

export const toVenueOptions = (venues: readonly RunningVenue[]): KkSelectOption[] => [
  { value: NO_VENUE_ID, label: NO_VENUE_LABEL },
  ...venues.map((venue) => ({ value: String(venue.venueId), label: venue.name })),
];

export const toOwnerSelectOptions = (options: readonly CalendarOwnerOption[]): KkSelectOption[] =>
  options.map((option) => ({ value: option.id, label: option.label }));

export const toTimeOptions = (): KkSelectOption[] =>
  toTimeChoices().map((time) => ({ value: time, label: time }));

export const toEntryOwnerLabel = (entry: CalendarEntry): string =>
  entry.ownerGroupName ?? CLUB_OWNER_LABEL;

export const toEntryFacts = (entry: CalendarEntry): KkConfirmFact[] => {
  const facts: KkConfirmFact[] = [
    { label: 'Termin', value: entry.title },
    {
      label: 'Wann',
      value: `${toIsoDayLabel(toLocalIsoDay(entry.startsAt))}, ${toTimeSpanLabel(entry.startsAt, entry.endsAt)}`,
    },
    { label: 'Art', value: CALENDAR_KIND_LABELS[entry.kind] },
    { label: 'Eigentümer', value: toEntryOwnerLabel(entry) },
  ];

  if (entry.venueName !== null) {
    facts.push({ label: 'Ort', value: entry.venueName });
  }

  return facts;
};

export const toDeleteConsequence = (entry: CalendarEntry): string => {
  if (entry.asksForResponse) {
    return `„${entry.title}“ verschwindet aus dem Kalender, und die schon abgegebenen Zu- und Absagen verschwinden mit.`;
  }

  return `„${entry.title}“ verschwindet aus dem Kalender. Rückgängig geht das nicht.`;
};

export const toEntryCreatedMessage = (title: string): string =>
  `„${title}“ steht jetzt im Kalender.`;

export const toEntrySavedMessage = (title: string): string => `„${title}“ ist gespeichert.`;

export const toEntryDeletedMessage = (title: string): string =>
  `„${title}“ ist aus dem Kalender gelöscht.`;
