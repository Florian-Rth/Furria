import type { KkEntryKindGlyphKind } from '@furria/ui';
import type { CalendarKindKey } from '@/lib/calendar-copy';
import type {
  CalendarLandmark,
  CalendarRelative,
  CalendarTime,
  CalendarWeekName,
} from './calendar-agenda';
import { isoWeekOf, shiftDay, weekdayIndexOf } from './calendar-agenda';
import type { CalendarEntryVisibility } from './schemas';

export const BOARD_LABEL = 'Termine nach Tagen';
export const STRIP_LABEL = 'Woche';
export const MONTH_LABEL = 'Monat';
export const OWED_LABEL = 'Zusage fehlt';
export const NOTHING_HERE = 'In diesem Zeitraum stehen keine Termine an.';
export const EARLIER_LABEL = 'Frühere Tage zeigen';
export const LATER_LABEL = 'Weitere Wochen laden';
export const PREVIOUS_WEEK = 'Vorherige Woche';
export const NEXT_WEEK = 'Nächste Woche';
export const PREVIOUS_MONTH = 'Vorheriger Monat';
export const NEXT_MONTH = 'Nächster Monat';
export const TODAY = 'Heute';
export const ADD_LABEL = 'Termin hinzufügen';
export const NO_ENTRIES_NOTE = 'keine Termine';
export const RUNNING_LABEL = 'läuft gerade';
export const LOADING_LABEL = 'Der Kalender wird geladen';
export const ERROR_MESSAGE = 'Der Kalender konnte nicht geladen werden.';
export const RETRY_LABEL = 'Noch einmal';
export const DETAIL_LABEL = 'Termin';
export const CLOSE_LABEL = 'Schließen';
export const EDIT_LABEL = 'Bearbeiten';
export const EVENT_LINK_LABEL = 'Veranstaltung öffnen';
export const ANSWER_TITLE = 'Deine Antwort';
export const MODES_LABEL = 'Ansicht der Woche';
export const MODE_LABELS = { days: 'Tage', hours: 'Stunden' } as const;
export const EXPAND_LABEL = 'Ganzen Monat zeigen';
export const COLLAPSE_LABEL = 'Monat einklappen';
export const CLOSE_HOURS_LABEL = 'Stunden einklappen';
export const HOURS_LABEL = 'Woche nach Uhrzeit';
export const HOURS_SHOW = 'Stunden zeigen';
export const HOURS_HIDE = 'Stunden ausblenden';
export const NOW_PREFIX = 'Jetzt';
export const DETAIL_EMPTY = 'Tippe einen Termin an.';
export const DETAIL_MISSING = 'Dieser Termin ist nicht mehr im Kalender.';

export const FACT_LABELS = {
  when: 'Wann',
  where: 'Wo',
  groups: 'Gruppen',
  visibility: 'Sichtbar',
  event: 'Karten',
} as const;

const WEEKDAYS = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'] as const;
const WEEKDAY_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;
const WEEKDAY_NAMES = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
] as const;
const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

export const WEEKDAY_HEADERS: readonly string[] = WEEKDAYS;

export const LANDMARK_LABELS: Record<CalendarLandmark, string> = {
  opening: 'Sessionseröffnung',
  womensCarnivalDay: 'Weiberfastnacht',
  roseMonday: 'Rosenmontag',
  carnivalTuesday: 'Karnevalsdienstag',
  ashWednesday: 'Aschermittwoch',
};

export const VISIBILITY_LABELS: Record<CalendarEntryVisibility, string> = {
  group: 'Nur Gruppe',
  club: 'Ganzer Verein',
  public: 'Öffentlich',
};

export const KIND_GLYPHS: Record<CalendarKindKey, KkEntryKindGlyphKind> = {
  training: 'training',
  rehearsal: 'rehearsal',
  performance: 'performance',
  meeting: 'meeting',
  party: 'party',
  other: 'other',
  event: 'event',
};

const CLUB_LABEL = 'Verein';

const NAMED_WEEKS: Record<Exclude<CalendarWeekName, 'numbered'>, string> = {
  current: 'Diese Woche',
  next: 'Nächste Woche',
  previous: 'Letzte Woche',
};

export const toWeekTitle = (name: CalendarWeekName, monday: string): string =>
  name === 'numbered' ? toWeekRuleLabel(monday) : NAMED_WEEKS[name];

const dayMonth = (isoDay: string): string => `${isoDay.slice(8, 10)}.${isoDay.slice(5, 7)}.`;

export const weekdayOf = (isoDay: string): string => WEEKDAYS[weekdayIndexOf(isoDay)] ?? '';

export const toDayHeadDate = (isoDay: string): string => `${weekdayOf(isoDay)} ${dayMonth(isoDay)}`;

export const toDayLongLabel = (isoDay: string): string =>
  `${WEEKDAY_NAMES[weekdayIndexOf(isoDay)] ?? ''}, ${dayMonth(isoDay)}${isoDay.slice(0, 4)}`;

export const toRelativeLabel = (relative: CalendarRelative): string => {
  switch (relative.kind) {
    case 'today':
      return 'Heute';
    case 'tomorrow':
      return 'Morgen';
    case 'yesterday':
      return 'Gestern';
    case 'ahead':
      return `in ${relative.days} Tagen`;
    case 'past':
      return `vor ${relative.days} Tagen`;
  }
};

export const toGapLabel = (fromDay: string, toDay: string): string => {
  const first = WEEKDAY_SHORT[weekdayIndexOf(fromDay)] ?? '';

  if (fromDay === toDay) {
    return `${first} ${dayMonth(fromDay)} keine Termine`;
  }

  return `${first}–${WEEKDAY_SHORT[weekdayIndexOf(toDay)] ?? ''} keine Termine`;
};

export const toWeekRuleLabel = (isoDay: string): string => `KW ${isoWeekOf(isoDay)}`;

export const toWeekRange = (fromDay: string, toDay: string): string =>
  `${Number(fromDay.slice(8, 10))}.${Number(fromDay.slice(5, 7))}.–${Number(toDay.slice(8, 10))}.${Number(toDay.slice(5, 7))}.`;

export const toDayMonth = dayMonth;

export const weekdayShortOf = (isoDay: string): string =>
  WEEKDAY_SHORT[weekdayIndexOf(isoDay)] ?? '';

export const toMonthName = (isoDay: string): string => MONTHS[Number(isoDay.slice(5, 7)) - 1] ?? '';

export const toMonthCaption = (monthStart: string): string => monthStart.slice(0, 4);

export const toWeekCaption = (monday: string, todayDay: string, short: boolean): string => {
  const week = toWeekRuleLabel(monday);
  const year = shiftDay(monday, 3).slice(0, 4);

  return short || year === todayDay.slice(0, 4) ? week : `${week} · ${year}`;
};

export const toGroupName = (name: string | null): string => name ?? CLUB_LABEL;

export interface CalendarTimeCopy {
  main: string;
  sub: string | null;
  spoken: string;
}

export const toTimeCopy = (time: CalendarTime): CalendarTimeCopy => {
  if (time.kind === 'single') {
    const nextDay = time.endDayOffset > 0 ? ` +${time.endDayOffset}` : '';

    return {
      main: time.start,
      sub: time.end === null ? null : `${time.end}${nextDay}`,
      spoken:
        time.end === null ? `ab ${time.start} Uhr` : `${time.start} bis ${time.end} Uhr${nextDay}`,
    };
  }
  if (time.kind === 'first') {
    return {
      main: time.start,
      sub: `Tag 1/${time.dayCount}`,
      spoken: `ab ${time.start} Uhr, Tag 1 von ${time.dayCount}`,
    };
  }

  const day = time.dayIndex + 1;

  if (time.end === null) {
    return {
      main: `Tag ${day}`,
      sub: `von ${time.dayCount}`,
      spoken: `Tag ${day} von ${time.dayCount}`,
    };
  }

  return {
    main: `bis ${time.end}`,
    sub: `Tag ${day}/${time.dayCount}`,
    spoken: `bis ${time.end} Uhr, Tag ${day} von ${time.dayCount}`,
  };
};

export const toBadgeSpoken = (answerLabel: string, title: string): string =>
  `Deine Antwort zu „${title}“: ${answerLabel}. Ändern`;

export const toLineSpoken = (
  title: string,
  kindLabel: string,
  when: string,
  venue: string | null,
): string => [title, kindLabel, when, venue].filter((part) => part !== null).join(', ');

export const toDayCellSpoken = (isoDay: string, count: number, owed: boolean): string => {
  const entries = count === 0 ? 'keine Termine' : count === 1 ? 'ein Termin' : `${count} Termine`;

  return `${toDayLongLabel(isoDay)}, ${entries}${owed ? ', Zusage fehlt' : ''}`;
};

export const toHoursDayLabel = (isoDay: string, count: number): string => {
  const entries = count === 0 ? 'keine Termine' : count === 1 ? 'ein Termin' : `${count} Termine`;

  return `${toDayLongLabel(isoDay)}, ${entries}`;
};

export const toBlockSpoken = (
  title: string,
  when: string,
  owner: string,
  live: boolean,
  owed: boolean,
): string =>
  [title, when, owner, live ? RUNNING_LABEL : null, owed ? OWED_LABEL : null]
    .filter((part) => part !== null)
    .join(', ');

export const toNowLabel = (clock: string): string => `${NOW_PREFIX} ${clock}`;
