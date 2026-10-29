import { z } from 'zod';

export const OPENING_WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

const WEEKDAY_SHORT_NAMES: Record<OpeningWeekday, string> = {
  monday: 'Mo',
  tuesday: 'Di',
  wednesday: 'Mi',
  thursday: 'Do',
  friday: 'Fr',
  saturday: 'Sa',
  sunday: 'So',
};

const CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?$/;
const FEWEST_DAYS_FOR_A_RANGE = 3;

export const OpeningWeekdaySchema = z.enum(OPENING_WEEKDAYS);
export type OpeningWeekday = z.infer<typeof OpeningWeekdaySchema>;

export const OpeningSlotSchema = z.object({
  weekday: OpeningWeekdaySchema,
  opens: z.string().regex(CLOCK_TIME_PATTERN),
  closes: z.string().regex(CLOCK_TIME_PATTERN),
});
export type OpeningSlot = z.infer<typeof OpeningSlotSchema>;

export interface OpeningHoursLine {
  days: string;
  times: string;
}

interface DayHours {
  weekday: OpeningWeekday;
  times: string;
}

const minutesOf = (clockTime: string): number => {
  const [hours = '0', minutes = '0'] = clockTime.split(':');
  return Number(hours) * 60 + Number(minutes);
};

const clockLabelOf = (clockTime: string): string => {
  const [hours = '0', minutes = '00'] = clockTime.split(':');
  const hour = String(Number(hours));
  return minutes === '00' ? hour : `${hour}:${minutes}`;
};

const timesOf = (slots: readonly OpeningSlot[]): string =>
  [...slots]
    .sort((first, second) => minutesOf(first.opens) - minutesOf(second.opens))
    .map((slot) => `${clockLabelOf(slot.opens)}–${clockLabelOf(slot.closes)}`)
    .join(' · ');

const daysLabelOf = (run: readonly OpeningWeekday[]): string => {
  const first = run[0];
  const last = run[run.length - 1];
  if (first === undefined || last === undefined) {
    return '';
  }
  if (run.length >= FEWEST_DAYS_FOR_A_RANGE) {
    return `${WEEKDAY_SHORT_NAMES[first]}–${WEEKDAY_SHORT_NAMES[last]}`;
  }
  return run.map((weekday) => WEEKDAY_SHORT_NAMES[weekday]).join(', ');
};

const openDaysOf = (slots: readonly OpeningSlot[]): DayHours[] =>
  OPENING_WEEKDAYS.flatMap((weekday) => {
    const daySlots = slots.filter((slot) => slot.weekday === weekday);
    return daySlots.length === 0 ? [] : [{ weekday, times: timesOf(daySlots) }];
  });

const isNextDay = (previous: OpeningWeekday, next: OpeningWeekday): boolean =>
  OPENING_WEEKDAYS.indexOf(next) === OPENING_WEEKDAYS.indexOf(previous) + 1;

const runsOf = (days: readonly DayHours[]): DayHours[][] =>
  days.reduce<DayHours[][]>((runs, day) => {
    const currentRun = runs[runs.length - 1];
    const previous = currentRun?.[currentRun.length - 1];
    if (
      currentRun !== undefined &&
      previous !== undefined &&
      previous.times === day.times &&
      isNextDay(previous.weekday, day.weekday)
    ) {
      currentRun.push(day);
      return runs;
    }
    runs.push([day]);
    return runs;
  }, []);

export const formatOpeningHours = (slots: readonly OpeningSlot[]): OpeningHoursLine[] =>
  runsOf(openDaysOf(slots)).map((run) => ({
    days: daysLabelOf(run.map((day) => day.weekday)),
    times: run[0]?.times ?? '',
  }));
