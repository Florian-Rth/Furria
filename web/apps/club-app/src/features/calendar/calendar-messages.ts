import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const CALENDAR_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Der Kalender konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toCalendarErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, CALENDAR_ERROR_MESSAGES);
