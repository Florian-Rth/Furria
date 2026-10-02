import { toLocalIsoDay } from '@/lib/calendar-days';
import { toIsoDay } from '@/lib/day';
import type { Start } from './schemas';

const RESHAPE_REACH_MS = 12 * 60 * 60 * 1000;
const RESHAPE_GRACE_MS = 1000;
const RESHAPE_NOW_MS = 0;

export const refetchDelayOf = (reshapeAt: string | null, now: Date): number | null => {
  if (reshapeAt === null) {
    return null;
  }

  const lead = Date.parse(reshapeAt) - now.getTime();

  if (lead <= 0) {
    return RESHAPE_NOW_MS;
  }
  if (lead > RESHAPE_REACH_MS) {
    return null;
  }

  return lead + RESHAPE_GRACE_MS;
};

export const isStartOfDay = (start: Pick<Start, 'today' | 'asOf'>, now: Date): boolean => {
  const day = toIsoDay(now);

  return start.today === day || toLocalIsoDay(start.asOf) === day;
};
