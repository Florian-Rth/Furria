import type { KkWeekStripDayTone } from '@furria/ui/KkWeekStripDay';
import type { KkWeekStripMarkState } from '@furria/ui/KkWeekStripMark';
import { formatDayMonth } from './start-lines';
import type { StripDay, StripMark, StripSlot } from './week-strip';

export interface StripDayFace {
  weekday: string;
  number: string;
  tone: KkWeekStripDayTone;
  overflow: string | undefined;
  label: string;
}

const WEEKDAY_SHORT = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'] as const;
const WEEKDAY_FULL = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
] as const;
const LATER_WORD = 'SPÄTER';
const LATER_SPOKEN = 'Später';
const TODAY_WORD = 'Heute';
const TOMORROW_WORD = 'Morgen';
const NOTHING = 'nichts';
const NONE_LATER = '–';
const OPENS_DAY = 'im Kalender zeigen';

const STATE_SPOKEN: Record<KkWeekStripMarkState, string> = {
  live: 'läuft',
  owed: 'Zu-/Absage offen',
  answered: 'beantwortet',
  plain: '',
};

export const STRIP_LABEL = 'Deine Woche';

const localDayOf = (isoDay: string): Date => new Date(`${isoDay}T12:00:00`);

const weekdayIndexOf = (isoDay: string): number => localDayOf(isoDay).getDay();

const spokenMark = (mark: StripMark): string =>
  mark.state === 'plain'
    ? `${mark.time} ${mark.title}`
    : `${mark.time} ${mark.title} (${STATE_SPOKEN[mark.state]})`;

const spokenDayName = (isoDay: string, slot: StripSlot): string => {
  const weekday = WEEKDAY_FULL[weekdayIndexOf(isoDay)] ?? '';
  const date = formatDayMonth(isoDay);

  if (slot === 'today') {
    return `${TODAY_WORD}, ${weekday} ${date}`;
  }
  if (slot === 'tomorrow') {
    return `${TOMORROW_WORD}, ${weekday} ${date}`;
  }

  return `${weekday} ${date}`;
};

const toneOfSlot = (slot: StripSlot): KkWeekStripDayTone => {
  if (slot === 'today') {
    return 'today';
  }

  return slot === 'later' ? 'later' : 'day';
};

const spokenMarksOf = (day: StripDay): string =>
  day.marks.length === 0 ? NOTHING : `${day.marks.map(spokenMark).join(', ')} – ${OPENS_DAY}`;

export const toStripDayFace = (day: StripDay): StripDayFace => {
  const marks = spokenMarksOf(day);
  const overflow = day.overflow > 0 ? `+${day.overflow}` : undefined;

  if (day.isoDay === null) {
    return {
      weekday: LATER_WORD,
      number: day.marks.length === 0 ? NONE_LATER : `+${day.marks.length}`,
      tone: 'later',
      overflow,
      label: `${LATER_SPOKEN}: ${marks}`,
    };
  }

  return {
    weekday: WEEKDAY_SHORT[weekdayIndexOf(day.isoDay)] ?? '',
    number: String(localDayOf(day.isoDay).getDate()),
    tone: toneOfSlot(day.slot),
    overflow,
    label: `${spokenDayName(day.isoDay, day.slot)}: ${marks}`,
  };
};
