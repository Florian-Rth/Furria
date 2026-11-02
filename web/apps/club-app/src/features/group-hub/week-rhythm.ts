import type { Weekday } from '@/features/groups/group-identity';
import { WEEKDAY_VALUES } from '@/features/groups/group-identity';
import type { UsualTrainingTime } from './schemas';
import { toClockValue, toWeekdayLabel } from './usual-training-time-labels';

const WEEKDAY_SHORT: Record<Weekday, string> = {
  monday: 'Mo',
  tuesday: 'Di',
  wednesday: 'Mi',
  thursday: 'Do',
  friday: 'Fr',
  saturday: 'Sa',
  sunday: 'So',
};

const NO_TRAINING_LINE = 'kein Training';
const TIMES_SEPARATOR = ', ';
const CLOCK_SUFFIX = ' Uhr';

export const WEEK_RHYTHM_LABEL = 'Trainingswoche';

export interface WeekRhythmDay {
  weekday: Weekday;
  short: string;
  label: string;
  times: string[];
}

const toDayLabel = (weekday: Weekday, times: readonly string[]): string => {
  const line =
    times.length === 0 ? NO_TRAINING_LINE : `${times.join(TIMES_SEPARATOR)}${CLOCK_SUFFIX}`;

  return `${toWeekdayLabel(weekday)}: ${line}`;
};

export const toWeekRhythm = (usualTimes: readonly UsualTrainingTime[]): WeekRhythmDay[] =>
  WEEKDAY_VALUES.map((weekday) => {
    const times = [
      ...new Set(
        usualTimes
          .filter((usualTime) => usualTime.weekday === weekday)
          .map((usualTime) => toClockValue(usualTime.startsAt)),
      ),
    ].sort();

    return { weekday, short: WEEKDAY_SHORT[weekday], label: toDayLabel(weekday, times), times };
  });

export const inWeekOrder = (usualTimes: readonly UsualTrainingTime[]): UsualTrainingTime[] =>
  [...usualTimes].sort(
    (left, right) =>
      WEEKDAY_VALUES.indexOf(left.weekday) - WEEKDAY_VALUES.indexOf(right.weekday) ||
      left.startsAt.localeCompare(right.startsAt),
  );
