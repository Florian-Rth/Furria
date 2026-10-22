import type { KkPosterPhase } from '@furria/ui/poster-composition';
import {
  carnivalDaysOf,
  daysUntilOpening,
  relevantSessionYear,
  SESSION_OPENING_DAY,
  SESSION_OPENING_MONTH,
  sessionAt,
  sessionDayOf,
  sessionOpeningAt,
} from '@/lib/club';
import { toIsoDay } from '@/lib/day';

export interface StartSeason {
  phase: KkPosterPhase;
  runUp: number;
  evening: boolean;
}

const RUN_UP_DAYS = 55;
const EVENING_FROM_HOUR = 18;
const NIGHT_UNTIL_HOUR = 5;
const NO_RUN_UP = 0;
const FULL_RUN_UP = 1;

const isOpeningDay = (date: Date): boolean =>
  date.getMonth() === SESSION_OPENING_MONTH - 1 && date.getDate() === SESSION_OPENING_DAY;

const runUpShareOf = (date: Date): number => {
  const days = daysUntilOpening(date, relevantSessionYear(date));

  return days > RUN_UP_DAYS ? NO_RUN_UP : FULL_RUN_UP - Math.max(days, 0) / RUN_UP_DAYS;
};

const runningPhaseOf = (date: Date): KkPosterPhase => {
  const days = carnivalDaysOf(sessionAt(date).startYear);
  const today = toIsoDay(date);

  if (today === toIsoDay(days.ashWednesday)) {
    return 'ashWednesday';
  }
  if (today >= toIsoDay(days.womensCarnivalDay)) {
    return 'hotDays';
  }

  return 'hall';
};

const phaseOf = (date: Date): KkPosterPhase => {
  if (isOpeningDay(date)) {
    return date >= sessionOpeningAt(date.getFullYear()) ? 'opening' : 'runUp';
  }
  if (sessionDayOf(date) !== null) {
    return runningPhaseOf(date);
  }

  return runUpShareOf(date) > NO_RUN_UP ? 'runUp' : 'offSeason';
};

export const isEveningAt = (date: Date): boolean =>
  date.getHours() >= EVENING_FROM_HOUR || date.getHours() < NIGHT_UNTIL_HOUR;

export const startSeasonAt = (date: Date): StartSeason => {
  const phase = phaseOf(date);

  return {
    phase,
    runUp: phase === 'runUp' ? runUpShareOf(date) : NO_RUN_UP,
    evening: isEveningAt(date),
  };
};
