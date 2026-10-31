import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import type { KkDateQuickChoice } from '@furria/ui/KkDateField';
import type { KkSelectOption } from '@furria/ui/KkSelectField';
import { CALENDAR_KIND_LABELS } from '@/lib/calendar-copy';
import { toIsoDayLabel, toLocalIsoDay, toTimeSpanLabel } from '@/lib/calendar-days';
import { toIsoDay } from '@/lib/day';
import { asksForAnswer } from './calendar-agenda';
import type { CalendarOwnerOption } from './calendar-authoring';
import { NO_VENUE_ID } from './calendar-authoring';
import type { CalendarEntry, CalendarEntryVisibility, RunningVenue } from './schemas';

export const CALENDAR_ERROR_TITLE = 'KALENDER NICHT GELADEN';
export const CALENDAR_RETRY_LABEL = 'Noch einmal';
export const CALENDAR_LEAD = 'Termine, Trainings und Sitzungen des Vereins.';
export const CALENDAR_ENTRY_CREATE_TITLE = 'Termin hinzufügen';
export const CALENDAR_ENTRY_EDIT_TITLE = 'Termin ändern';
export const DELETE_ENTRY_DANGER_LABEL = 'Termin löschen';

const TODAY_LABEL = 'Heute';
const TOMORROW_LABEL = 'Morgen';
const CLUB_OWNER_LABEL = 'Verein';
const NO_VENUE_LABEL = 'Kein Ort';

const CALENDAR_VISIBILITY_LABELS: Record<CalendarEntryVisibility, string> = {
  group: 'Gruppenintern',
  club: 'Verein',
  public: 'Öffentlich',
};

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

export const toStartDayQuickChoices = (today: Date): KkDateQuickChoice[] => [
  { label: TODAY_LABEL, value: toIsoDay(today) },
  {
    label: TOMORROW_LABEL,
    value: toIsoDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)),
  },
];

const toEntryOwnerLabel = (entry: CalendarEntry): string =>
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
  if (asksForAnswer(entry)) {
    return `„${entry.title}“ wird mit allen Zu- und Absagen gelöscht.`;
  }

  return `„${entry.title}“ wird endgültig gelöscht.`;
};

export const toEntryCreatedMessage = (title: string): string =>
  `„${title}“ steht jetzt im Kalender.`;

export const toEntrySavedMessage = (title: string): string => `„${title}“ ist gespeichert.`;

export const toEntryDeletedMessage = (title: string): string =>
  `„${title}“ ist aus dem Kalender gelöscht.`;
