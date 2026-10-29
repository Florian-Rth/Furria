import { relevantSessionYear, sessionAt } from '@/lib/club';

export const actsSessionOfEvening = (startsAt: string | null, now: Date): number | null => {
  if (startsAt === null) {
    return null;
  }

  const eveningSession = sessionAt(new Date(startsAt)).startYear;

  return eveningSession === relevantSessionYear(now) ? null : eveningSession;
};
