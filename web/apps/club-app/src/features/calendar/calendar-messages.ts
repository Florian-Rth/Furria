import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const CALENDAR_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Der Kalender hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Der Kalender konnte nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toCalendarErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, CALENDAR_ERROR_MESSAGES);
