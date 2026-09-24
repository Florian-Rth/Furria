import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const LIST_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Gruppenverwaltung konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

const DETAILS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Diese Gruppe konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

const KINDS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Die Gruppenarten haben den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Die Gruppenarten konnten nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toGroupKindsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, KINDS_ERROR_MESSAGES);

export const toManagedGroupsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, LIST_ERROR_MESSAGES);

export const toManagedGroupErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return null;
  }

  return toQueryErrorMessage(error, DETAILS_ERROR_MESSAGES);
};
