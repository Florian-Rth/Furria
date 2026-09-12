import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const ROLES_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Die Rollen haben den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Die Rollen konnten nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

const ROLE_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Diese Rolle hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Die Rolle konnte nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toRolesErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, ROLES_ERROR_MESSAGES);

export const toRoleErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return null;
  }

  return toQueryErrorMessage(error, ROLE_ERROR_MESSAGES);
};
