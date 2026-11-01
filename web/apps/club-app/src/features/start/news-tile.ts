import { format } from 'date-fns';
import { de } from 'date-fns/locale/de';
import { calendarDaysBetween } from '@/lib/club';

export type PublishedDay =
  | { kind: 'today' }
  | { kind: 'yesterday' }
  | { kind: 'date'; date: string };

const YESTERDAY = 1;
const DATE_FORMAT = 'd. MMM';

export const publishedDayOf = (publishedAt: string, now: Date): PublishedDay => {
  const published = new Date(publishedAt);
  const daysAgo = calendarDaysBetween(published, now);

  if (daysAgo <= 0) {
    return { kind: 'today' };
  }
  if (daysAgo === YESTERDAY) {
    return { kind: 'yesterday' };
  }

  return { kind: 'date', date: format(published, DATE_FORMAT, { locale: de }) };
};
