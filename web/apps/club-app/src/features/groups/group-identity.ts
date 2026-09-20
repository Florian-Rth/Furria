import type { KkGroupTone } from '@furria/ui';
import { GROUP_TONES } from '@furria/ui';

export type GroupTone = KkGroupTone;

export const WEEKDAY_VALUES = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type Weekday = (typeof WEEKDAY_VALUES)[number];

export interface TrainingSlotFacts {
  readonly weekday: Weekday;
  readonly startsAt: string;
  readonly durationMinutes: number;
  readonly venueName: string | null;
}

export interface Jubilee {
  readonly years: number;
  readonly label: string;
}

export const JUBILEE_STEP = 5;

const FALLBACK_TONE: GroupTone = 'clay';
const FOUNDED_PREFIX = 'seit ';
const JUBILEE_SUFFIX = ' Jahre';
const RHYTHM_LEAD = 'Wir trainieren ';
const RHYTHM_END = '.';
const RHYTHM_SEPARATOR = ', ';
const RHYTHM_LAST_SEPARATOR = ' und ';
const VENUE_SEPARATOR = ', ';
const TIME_SPAN_SEPARATOR = ' – ';
const CLOCK_SUFFIX = ' Uhr';
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;
const NO_YEARS = 0;
const ONE_SLOT = 1;

const WEEKDAY_ADVERBS: Record<Weekday, string> = {
  monday: 'montags',
  tuesday: 'dienstags',
  wednesday: 'mittwochs',
  thursday: 'donnerstags',
  friday: 'freitags',
  saturday: 'samstags',
  sunday: 'sonntags',
};

const pad = (value: number): string => String(value).padStart(2, '0');

const toMinuteOfDay = (clockTime: string): number => {
  const [hours = '0', minutes = '0'] = clockTime.split(':');

  return Number(hours) * MINUTES_PER_HOUR + Number(minutes);
};

const toClockLabel = (minuteOfDay: number): string => {
  const wrapped = ((minuteOfDay % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  return `${pad(Math.floor(wrapped / MINUTES_PER_HOUR))}:${pad(wrapped % MINUTES_PER_HOUR)}`;
};

export const toGroupTone = (groupId: number, tone: GroupTone | null): GroupTone => {
  if (tone !== null) {
    return tone;
  }

  return GROUP_TONES[Math.abs(groupId) % GROUP_TONES.length] ?? FALLBACK_TONE;
};

export const toJubilee = (foundedYear: number | null, sessionYear: number): Jubilee | null => {
  if (foundedYear === null) {
    return null;
  }

  const years = sessionYear - foundedYear;

  if (years <= NO_YEARS || years % JUBILEE_STEP !== 0) {
    return null;
  }

  return { years, label: `${years}${JUBILEE_SUFFIX}` };
};

export const toFoundedLine = (foundedYear: number | null): string | null =>
  foundedYear === null ? null : `${FOUNDED_PREFIX}${foundedYear}`;

export const toTrainingSlotLine = (slot: TrainingSlotFacts): string => {
  const startsAt = toMinuteOfDay(slot.startsAt);
  const span = `${toClockLabel(startsAt)}${TIME_SPAN_SEPARATOR}${toClockLabel(startsAt + slot.durationMinutes)}${CLOCK_SUFFIX}`;
  const venue = slot.venueName === null ? '' : `${VENUE_SEPARATOR}${slot.venueName}`;

  return `${WEEKDAY_ADVERBS[slot.weekday]} ${span}${venue}`;
};

export const toRhythmSentence = (slots: readonly TrainingSlotFacts[]): string | null => {
  if (slots.length === 0) {
    return null;
  }

  const lines = slots.map(toTrainingSlotLine);
  const last = lines.slice(-ONE_SLOT).join('');
  const leading = lines.slice(0, -ONE_SLOT);
  const joined =
    leading.length === 0
      ? last
      : `${leading.join(RHYTHM_SEPARATOR)}${RHYTHM_LAST_SEPARATOR}${last}`;

  return `${RHYTHM_LEAD}${joined}${RHYTHM_END}`;
};
