import { relevantSessionYear } from '@/lib/club';

export const actsSessionOfEvening = (startsAt: string | null, now: Date): number | null => {
  if (startsAt === null) {
    return null;
  }

  const eveningSession = relevantSessionYear(new Date(startsAt));

  return eveningSession === relevantSessionYear(now) ? null : eveningSession;
};
