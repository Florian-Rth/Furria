import type { KkSelectOption } from '@furria/ui';
import type { Weekday } from '@/features/groups';
import { WEEKDAY_VALUES } from '@/features/groups';
import type { TrainingSlot, TrainingSlotForm } from './schemas';

export const RHYTHM_EMPTY_TITLE = 'NOCH KEIN RHYTHMUS';
export const RHYTHM_EMPTY_LINE =
  'Wann und wo die Gruppe regelmäßig trainiert. Die Gruppen-Admins tragen es hier ein.';
export const RHYTHM_ADMIN_NOTE =
  'Der Rhythmus ist eine Angabe, keine Regel: Er sagt, wann ihr normalerweise trainiert. Termine entstehen erst, wenn du sie erzeugst.';
export const RHYTHM_ADD_LABEL = 'Trainingszeit';
export const RHYTHM_ADD_ACTION_LABEL = 'Trainingszeit hinzufügen';
export const RHYTHM_GENERATE_LABEL = 'Trainings erzeugen';
export const RHYTHM_GENERATE_HINT =
  'Aus dem Rhythmus entstehen einzelne Termine im Kalender. Du siehst jeden Tag vorher und hakst ab, was entstehen soll.';
export const RHYTHM_SAVED_MESSAGE = 'Der Trainingsrhythmus ist gespeichert.';
export const RHYTHM_FULL_NOTE = 'Mehr Trainingszeiten passen nicht in eine Woche.';
export const RHYTHM_ARCHIVED_VENUE_NOTE =
  'Eine Trainingszeit hält einen archivierten Ort. Solange er dort steht, lässt sich am Rhythmus nichts speichern — öffne die markierte Zeit und wähl einen anderen Ort.';

export const SLOT_DIALOG_ADD_TITLE = 'Trainingszeit hinzufügen';
export const SLOT_DIALOG_EDIT_TITLE = 'Trainingszeit ändern';
export const SLOT_WEEKDAY_LABEL = 'Wochentag';
export const SLOT_START_LABEL = 'Beginn';
export const SLOT_DURATION_LABEL = 'Dauer';
export const SLOT_VENUE_LABEL = 'Ort';
export const SLOT_VENUE_HINT = 'Ohne Ort warnt die Vorschau nicht vor Doppelbelegungen.';

export const SLOT_REMOVE_LABEL = 'Trainingszeit entfernen';
export const SLOT_REMOVE_EYEBROW = 'Trainingszeit entfernen';
export const SLOT_REMOVE_EXPLANATION =
  'Die Trainingszeit verschwindet aus dem Rhythmus. Schon erzeugte Termine bleiben im Kalender stehen.';

export const GENERATOR_SHEET_TITLE = 'Trainings erzeugen';
export const GENERATOR_TITLE_LABEL = 'Titel der Termine';
export const GENERATOR_TITLE_HINT = 'So heißt jeder erzeugte Termin im Kalender.';
export const GENERATOR_TITLE_DEFAULT = 'Training';
export const GENERATOR_END_LABEL = 'Bis einschließlich';
export const GENERATOR_END_HINT =
  'Voreingestellt ist das Ende der laufenden Session. Wer über den Sommer trainiert, setzt es weiter.';
export const GENERATOR_SESSION_CHOICE = 'Sessionende';
export const GENERATOR_CONFIRM_LABEL = 'Termine anlegen';
export const GENERATOR_CANCEL_LABEL = 'Abbrechen';
export const GENERATOR_CLOSE_LABEL = 'Schließen';
export const GENERATOR_EMPTY_TITLE = 'NICHTS ZU ERZEUGEN';
export const GENERATOR_EMPTY_LINE =
  'Für diesen Zeitraum ergibt der Rhythmus keinen einzigen Termin.';
export const GENERATOR_NO_RHYTHM_TITLE = 'ERST DER RHYTHMUS';
export const GENERATOR_NO_RHYTHM_LINE =
  'Trag zuerst ein, wann die Gruppe trainiert. Daraus entstehen die Termine.';
export const GENERATOR_LEGEND =
  'Hak ab, was entstehen soll. Feiertage, Ferien und ausgefallene Abende hakst du einfach weg.';
export const GENERATOR_ALL_LABEL = 'Alle';
export const GENERATOR_NONE_LABEL = 'Keinen';

const MINUTES_PER_HOUR = 60;
const DURATION_CHOICES = [45, 60, 75, 90, 105, 120, 150, 180] as const;
const NO_VENUE_VALUE = '';
const NO_VENUE_LABEL = 'Kein Ort';
const NO_VENUE_LINE = 'Ohne Ort';
const ARCHIVED_VENUE_SUFFIX = ' — archiviert';
const ONE_TRAINING = 1;

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

export const toDurationLabel = (minutes: number): string => {
  if (minutes < MINUTES_PER_HOUR) {
    return `${minutes} Minuten`;
  }

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;

  if (rest === 0) {
    return hours === 1 ? '1 Stunde' : `${hours} Stunden`;
  }

  return `${hours}:${pad(rest)} Stunden`;
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

export interface RhythmVenueRef {
  venueId: number;
  name: string;
}

export const toHeldVenue = (slot: TrainingSlot | null): RhythmVenueRef | null =>
  slot === null || slot.venueId === null || slot.venueName === null
    ? null
    : { venueId: slot.venueId, name: slot.venueName };

export const toRhythmVenueOptions = (
  venues: readonly RhythmVenueRef[] | null,
  held: RhythmVenueRef | null,
): KkSelectOption[] => {
  const offered = (venues ?? []).map((venue) => ({
    value: String(venue.venueId),
    label: venue.name,
  }));

  if (held === null || offered.some((option) => option.value === String(held.venueId))) {
    return [{ value: NO_VENUE_VALUE, label: NO_VENUE_LABEL }, ...offered];
  }

  const label = venues === null ? held.name : `${held.name}${ARCHIVED_VENUE_SUFFIX}`;

  return [
    { value: NO_VENUE_VALUE, label: NO_VENUE_LABEL },
    ...offered,
    { value: String(held.venueId), label },
  ];
};

export const toUnavailableVenueIds = (
  slots: readonly TrainingSlot[],
  venues: readonly RhythmVenueRef[] | null,
): ReadonlySet<number> => {
  if (venues === null) {
    return new Set();
  }

  const running = new Set(venues.map((venue) => venue.venueId));

  return new Set(
    slots.flatMap((slot) =>
      slot.venueId !== null && !running.has(slot.venueId) ? [slot.venueId] : [],
    ),
  );
};

export const toSlotVenueLine = (venueName: string | null, isArchived: boolean): string => {
  if (venueName === null) {
    return NO_VENUE_LINE;
  }

  return isArchived ? `${venueName}${ARCHIVED_VENUE_SUFFIX}` : venueName;
};

export const toClockValue = (startsAt: string): string => startsAt.slice(0, 5);

export interface SlotFact {
  label: string;
  value: string;
}

export const toSlotRemoveFacts = (slot: TrainingSlot, venueIsArchived: boolean): SlotFact[] => [
  { label: SLOT_WEEKDAY_LABEL, value: toWeekdayLabel(slot.weekday) },
  { label: SLOT_START_LABEL, value: toClockValue(slot.startsAt) },
  { label: SLOT_DURATION_LABEL, value: toDurationLabel(slot.durationMinutes) },
  { label: SLOT_VENUE_LABEL, value: toSlotVenueLine(slot.venueName, venueIsArchived) },
];

export const toSlotFormValues = (slot: TrainingSlot | null): TrainingSlotForm =>
  slot === null
    ? { weekday: 'tuesday', startsAt: '19:30', durationMinutes: 90, venueId: NO_VENUE_VALUE }
    : {
        weekday: slot.weekday,
        startsAt: toClockValue(slot.startsAt),
        durationMinutes: slot.durationMinutes,
        venueId: toVenueValue(slot.venueId),
      };

export interface TrainingSlotPayload {
  weekday: Weekday;
  startsAt: string;
  durationMinutes: number;
  venueId: number | null;
}

export const toSlotPayload = (form: TrainingSlotForm): TrainingSlotPayload => ({
  weekday: form.weekday,
  startsAt: `${toClockValue(form.startsAt)}:00`,
  durationMinutes: form.durationMinutes,
  venueId: toVenueId(form.venueId),
});

export const toSlotPayloadOf = (slot: TrainingSlot): TrainingSlotPayload => ({
  weekday: slot.weekday,
  startsAt: `${toClockValue(slot.startsAt)}:00`,
  durationMinutes: slot.durationMinutes,
  venueId: slot.venueId,
});

export const toRhythmMeta = (count: number): string => {
  if (count === 0) {
    return 'keine Trainingszeit';
  }

  return count === ONE_TRAINING ? '1 Trainingszeit' : `${count} Trainingszeiten`;
};

export const toTrainingsCreatedMessage = (created: number, skipped: number): string => {
  const held =
    skipped === 0
      ? ''
      : ` ${skipped === ONE_TRAINING ? '1 Termin stand' : `${skipped} Termine standen`} schon.`;

  if (created === 0) {
    return `Es ist kein Termin entstanden.${held}`;
  }
  if (created === ONE_TRAINING) {
    return `1 Training steht jetzt im Kalender.${held}`;
  }

  return `${created} Trainings stehen jetzt im Kalender.${held}`;
};

export const toCollisionNotice = (count: number): string | null => {
  if (count === 0) {
    return null;
  }

  return count === ONE_TRAINING
    ? 'An einem Abend ist der Ort doppelt belegt. Sieh im Kalender nach.'
    : `An ${count} Abenden ist der Ort doppelt belegt. Sieh im Kalender nach.`;
};
