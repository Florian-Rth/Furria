import { format } from 'date-fns';
import { de } from 'date-fns/locale/de';
import { CANCELLED_WORD, NEWS_POST_LINE } from './rich-text-copy';

const MOMENT = 'EEEEEE, d. MMM yyyy · HH:mm';
const DAY = 'd. MMMM yyyy';

export const mentionMomentOf = (iso: string): string =>
  format(new Date(iso), MOMENT, { locale: de });

export const mentionDayOf = (iso: string): string => format(new Date(iso), DAY, { locale: de });

export const calendarMentionLineOf = (startsAt: string, isCancelled: boolean): string =>
  isCancelled ? `${mentionMomentOf(startsAt)} · ${CANCELLED_WORD}` : mentionMomentOf(startsAt);

export const newsPostMentionLineOf = (publishedAt: string): string =>
  `${NEWS_POST_LINE} ${mentionDayOf(publishedAt)}`;
