import { isKkLapClosingAt } from '@furria/ui';
import type { MeRelevantSession } from '@/lib/api/schemas';
import { calendarDaysBetween, sessionOpeningAt } from '@/lib/club';

const LAP_CLOSING_REACH_DAYS = 30;

export const lapClosingAt = (now: Date, session: MeRelevantSession | null): number | null => {
  if (session === null || !isKkLapClosingAt(session.ordinal)) {
    return null;
  }

  const daysSinceOpening = calendarDaysBetween(sessionOpeningAt(session.startYear), now);

  return daysSinceOpening >= 0 && daysSinceOpening <= LAP_CLOSING_REACH_DAYS
    ? session.ordinal
    : null;
};
