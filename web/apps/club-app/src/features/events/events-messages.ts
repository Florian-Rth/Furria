import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const EVENTS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Veranstaltungen konnten nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

const EVENT_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  ...EVENTS_ERROR_MESSAGES,
  unexpected: 'Die Veranstaltung konnte nicht geladen werden.',
};

const TICKET_REQUESTS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  ...EVENTS_ERROR_MESSAGES,
  unexpected: 'Die Kartenanfragen konnten nicht geladen werden.',
};

export const toEventsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, EVENTS_ERROR_MESSAGES);

export const toEventErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, EVENT_ERROR_MESSAGES);

export const toTicketRequestsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, TICKET_REQUESTS_ERROR_MESSAGES);
