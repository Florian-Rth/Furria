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

export const toEventsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, EVENTS_ERROR_MESSAGES);

export const toEventErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, EVENT_ERROR_MESSAGES);

const RUNNING_ORDER_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  ...EVENTS_ERROR_MESSAGES,
  unexpected: 'Der Ablauf konnte nicht geladen werden.',
};

export const toRunningOrderErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, RUNNING_ORDER_ERROR_MESSAGES);
