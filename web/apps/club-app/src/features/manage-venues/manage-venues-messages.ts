import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const LIST_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Orte konnten nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toManagedVenuesErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, LIST_ERROR_MESSAGES);
