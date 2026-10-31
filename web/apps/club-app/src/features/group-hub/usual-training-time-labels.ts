import type { KkSelectOption } from '@furria/ui/KkSelectField';
import type { Weekday } from '@/features/groups/group-identity';
import { WEEKDAY_VALUES } from '@/features/groups/group-identity';
import type { UsualTrainingTime, UsualTrainingTimeForm } from './schemas';

export const USUAL_TIMES_EMPTY_TITLE = 'KEINE ÜBLICHE ZEIT';
export const USUAL_TIMES_EMPTY_LINE = 'Die Gruppe nennt keine übliche Trainingszeit.';
export const USUAL_TIMES_ADMIN_NOTE =
  'Steht im Kalender nur als Hinweis, nicht als fester Termin. Einzelne Trainings planst du unter Termine.';
export const USUAL_TIMES_ADD_LABEL = 'Trainingszeit';
export const USUAL_TIMES_ADD_ACTION_LABEL = 'Übliche Trainingszeit hinzufügen';
export const USUAL_TIMES_SAVED_MESSAGE = 'Die üblichen Trainingszeiten sind gespeichert.';
export const USUAL_TIMES_FULL_NOTE = 'Die maximale Anzahl an Trainingszeiten ist erreicht.';
export const USUAL_TIMES_ARCHIVED_VENUE_NOTE =
  'Eine Trainingszeit verwendet einen archivierten Ort. Wähle dort einen anderen Ort, um speichern zu können.';

export const USUAL_TIME_DIALOG_ADD_TITLE = 'Übliche Trainingszeit hinzufügen';
export const USUAL_TIME_DIALOG_EDIT_TITLE = 'Übliche Trainingszeit ändern';
export const USUAL_TIME_WEEKDAY_LABEL = 'Wochentag';
export const USUAL_TIME_START_LABEL = 'Beginn';
export const USUAL_TIME_DURATION_LABEL = 'Dauer';
export const USUAL_TIME_VENUE_LABEL = 'Ort';
export const USUAL_TIME_VENUE_HINT = 'Nur mit Ort werden Doppelbelegungen erkannt.';

export const USUAL_TIME_REMOVE_LABEL = 'Trainingszeit entfernen';
export const USUAL_TIME_REMOVE_EYEBROW = 'Trainingszeit entfernen';
export const USUAL_TIME_REMOVE_EXPLANATION = 'Geplante Trainings bleiben im Kalender erhalten.';

const MINUTES_PER_HOUR = 60;
const DURATION_CHOICES = [45, 60, 75, 90, 105, 120, 150, 180] as const;
const NO_VENUE_VALUE = '';
const NO_VENUE_LABEL = 'Kein Ort';
const NO_VENUE_LINE = 'Ohne Ort';
const ARCHIVED_VENUE_SUFFIX = ' — archiviert';

const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: 'Montag',
  tuesday: 'Dienstag',
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag',
};

const pad = (value: number): string => String(value).padStart(2, '0');

export const toWeekdayLabel = (weekday: Weekday): string => WEEKDAY_LABELS[weekday];

export const WEEKDAY_OPTIONS: readonly KkSelectOption[] = WEEKDAY_VALUES.map((weekday) => ({
  value: weekday,
  label: WEEKDAY_LABELS[weekday],
}));

export type DurationParts =
  | { kind: 'minutes'; minutes: number }
  | { kind: 'hours'; hours: number }
  | { kind: 'hoursAndMinutes'; hours: number; minutes: number };

export const durationPartsOf = (minutes: number): DurationParts => {
  if (minutes < MINUTES_PER_HOUR) {
    return { kind: 'minutes', minutes };
  }

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;

  return rest === 0 ? { kind: 'hours', hours } : { kind: 'hoursAndMinutes', hours, minutes: rest };
};

const toHoursLabel = (hours: number): string => (hours === 1 ? '1 Stunde' : `${hours} Stunden`);

export const toDurationLabel = (minutes: number): string => {
  const parts = durationPartsOf(minutes);

  if (parts.kind === 'minutes') {
    return `${parts.minutes} Minuten`;
  }
  if (parts.kind === 'hours') {
    return toHoursLabel(parts.hours);
  }

  return `${parts.hours}:${pad(parts.minutes)} Stunden`;
};

export const toDurationOptions = (): KkSelectOption[] =>
  DURATION_CHOICES.map((minutes) => ({
    value: String(minutes),
    label: toDurationLabel(minutes),
  }));

export const toVenueValue = (venueId: number | null): string =>
  venueId === null ? NO_VENUE_VALUE : String(venueId);

export const toVenueId = (value: string): number | null =>
  value === NO_VENUE_VALUE ? null : Number(value);

export interface UsualTimesVenueRef {
  venueId: number;
  name: string;
}

export const toHeldVenue = (usualTime: UsualTrainingTime | null): UsualTimesVenueRef | null =>
  usualTime === null || usualTime.venueId === null || usualTime.venueName === null
    ? null
    : { venueId: usualTime.venueId, name: usualTime.venueName };

export type HeldVenueState = 'offered' | 'archived' | 'unlisted';

export const heldVenueStateOf = (
  venues: readonly UsualTimesVenueRef[] | null,
  held: UsualTimesVenueRef,
): HeldVenueState => {
  if (venues === null) {
    return 'unlisted';
  }

  return venues.some((venue) => venue.venueId === held.venueId) ? 'offered' : 'archived';
};

export const toUsualTimesVenueOptions = (
  venues: readonly UsualTimesVenueRef[] | null,
  held: UsualTimesVenueRef | null,
): KkSelectOption[] => {
  const offered = (venues ?? []).map((venue) => ({
    value: String(venue.venueId),
    label: venue.name,
  }));
  const options = [{ value: NO_VENUE_VALUE, label: NO_VENUE_LABEL }, ...offered];

  if (held === null) {
    return options;
  }

  const state = heldVenueStateOf(venues, held);

  if (state === 'offered') {
    return options;
  }

  const label = state === 'unlisted' ? held.name : `${held.name}${ARCHIVED_VENUE_SUFFIX}`;

  return [...options, { value: String(held.venueId), label }];
};

export const toUnavailableVenueIds = (
  usualTimes: readonly UsualTrainingTime[],
  venues: readonly UsualTimesVenueRef[] | null,
): ReadonlySet<number> => {
  if (venues === null) {
    return new Set();
  }

  const running = new Set(venues.map((venue) => venue.venueId));

  return new Set(
    usualTimes.flatMap((usualTime) =>
      usualTime.venueId !== null && !running.has(usualTime.venueId) ? [usualTime.venueId] : [],
    ),
  );
};

export const toUsualTimeVenueLine = (venueName: string | null, isArchived: boolean): string => {
  if (venueName === null) {
    return NO_VENUE_LINE;
  }

  return isArchived ? `${venueName}${ARCHIVED_VENUE_SUFFIX}` : venueName;
};

export const toClockValue = (startsAt: string): string => startsAt.slice(0, 5);

export interface UsualTimeFact {
  label: string;
  value: string;
}

export const toUsualTimeRemoveFacts = (
  usualTime: UsualTrainingTime,
  venueIsArchived: boolean,
): UsualTimeFact[] => [
  { label: USUAL_TIME_WEEKDAY_LABEL, value: toWeekdayLabel(usualTime.weekday) },
  { label: USUAL_TIME_START_LABEL, value: toClockValue(usualTime.startsAt) },
  { label: USUAL_TIME_DURATION_LABEL, value: toDurationLabel(usualTime.durationMinutes) },
  {
    label: USUAL_TIME_VENUE_LABEL,
    value: toUsualTimeVenueLine(usualTime.venueName, venueIsArchived),
  },
];

export const toUsualTimeFormValues = (
  usualTime: UsualTrainingTime | null,
): UsualTrainingTimeForm =>
  usualTime === null
    ? { weekday: 'tuesday', startsAt: '19:30', durationMinutes: 90, venueId: NO_VENUE_VALUE }
    : {
        weekday: usualTime.weekday,
        startsAt: toClockValue(usualTime.startsAt),
        durationMinutes: usualTime.durationMinutes,
        venueId: toVenueValue(usualTime.venueId),
      };

export interface UsualTrainingTimePayload {
  weekday: Weekday;
  startsAt: string;
  durationMinutes: number;
  venueId: number | null;
}

export const toUsualTimePayload = (form: UsualTrainingTimeForm): UsualTrainingTimePayload => ({
  weekday: form.weekday,
  startsAt: `${toClockValue(form.startsAt)}:00`,
  durationMinutes: form.durationMinutes,
  venueId: toVenueId(form.venueId),
});

export const toUsualTimePayloadOf = (usualTime: UsualTrainingTime): UsualTrainingTimePayload => ({
  weekday: usualTime.weekday,
  startsAt: `${toClockValue(usualTime.startsAt)}:00`,
  durationMinutes: usualTime.durationMinutes,
  venueId: usualTime.venueId,
});
