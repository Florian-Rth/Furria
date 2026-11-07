import type { KkGroupTone } from '@furria/ui/group-tone';
import { GROUP_TONES } from '@furria/ui/group-tone';

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

export interface Anniversary {
  readonly years: number;
  readonly label: string;
}

export const ANNIVERSARY_STEP = 5;

const FALLBACK_TONE: GroupTone = 'clay';
const FOUNDED_PREFIX = 'seit ';
const ANNIVERSARY_SUFFIX = ' Jahre';
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;
const NO_YEARS = 0;

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

export const toAnniversary = (
  foundedYear: number | null,
  sessionYear: number,
): Anniversary | null => {
  if (foundedYear === null) {
    return null;
  }

  const years = sessionYear - foundedYear;

  if (years <= NO_YEARS || years % ANNIVERSARY_STEP !== 0) {
    return null;
  }

  return { years, label: `${years}${ANNIVERSARY_SUFFIX}` };
};

export const toFoundedLine = (foundedYear: number | null): string | null =>
  foundedYear === null ? null : `${FOUNDED_PREFIX}${foundedYear}`;

export interface ClockSpan {
  readonly from: string;
  readonly to: string;
}

export const toClockSpan = (startsAt: string, durationMinutes: number): ClockSpan => {
  const startMinute = toMinuteOfDay(startsAt);

  return { from: toClockLabel(startMinute), to: toClockLabel(startMinute + durationMinutes) };
};
