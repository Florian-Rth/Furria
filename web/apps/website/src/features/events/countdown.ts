import { parseBerlinDateTime } from '@/lib/date';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

export const deriveCountdown = (targetIso: string, now: Date): Countdown | null => {
  const remainingMs = parseBerlinDateTime(targetIso).getTime() - now.getTime();
  if (remainingMs <= 0) {
    return null;
  }

  const totalSeconds = Math.floor(remainingMs / MS_PER_SECOND);
  const totalMinutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const totalHours = Math.floor(totalMinutes / MINUTES_PER_HOUR);

  return {
    days: Math.floor(totalHours / HOURS_PER_DAY),
    hours: totalHours % HOURS_PER_DAY,
    minutes: totalMinutes % MINUTES_PER_HOUR,
    seconds: totalSeconds % SECONDS_PER_MINUTE,
  };
};

export type CountdownLabelKind = 'days' | 'oneDay' | 'hours' | 'minutes' | 'seconds';

export const countdownLabelKindOf = (countdown: Countdown): CountdownLabelKind => {
  if (countdown.days > 1) {
    return 'days';
  }
  if (countdown.days === 1) {
    return 'oneDay';
  }
  if (countdown.hours > 0) {
    return 'hours';
  }
  if (countdown.minutes > 0) {
    return 'minutes';
  }
  return 'seconds';
};

const COUNTDOWN_LABELS: Record<CountdownLabelKind, (countdown: Countdown) => string> = {
  days: (countdown) => `in ${countdown.days} Tagen ${countdown.hours} Std.`,
  oneDay: (countdown) => `in 1 Tag ${countdown.hours} Std.`,
  hours: (countdown) => `in ${countdown.hours} Std. ${countdown.minutes} Min.`,
  minutes: (countdown) => `in ${countdown.minutes} Min. ${countdown.seconds} Sek.`,
  seconds: (countdown) => `in ${countdown.seconds} Sek.`,
};

export const formatCountdownLabel = (countdown: Countdown): string =>
  COUNTDOWN_LABELS[countdownLabelKindOf(countdown)](countdown);
