import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const PERSONS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Das Personenregister konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

const PERSON_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Diese Person konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toPersonsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, PERSONS_ERROR_MESSAGES);

export const toPersonErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return null;
  }

  return toQueryErrorMessage(error, PERSON_ERROR_MESSAGES);
};
