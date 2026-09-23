import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const ROLES_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Rollen konnten nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

const ROLE_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Rolle konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toRolesErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, ROLES_ERROR_MESSAGES);

export const toRoleErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return null;
  }

  return toQueryErrorMessage(error, ROLE_ERROR_MESSAGES);
};
