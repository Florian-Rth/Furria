import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const ROLES_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Die Rollen haben den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Da ist etwas schiefgelaufen. Bitte versuch es gleich noch einmal.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

const WRITE_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Das hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Das hat nicht geklappt. Bitte versuch es gleich noch einmal.',
  rejected: 'Der Server hat diese Änderung nicht angenommen.',
};

export const toRolesErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, ROLES_ERROR_MESSAGES);

export const toRoleErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return null;
  }

  return toQueryErrorMessage(error, ROLES_ERROR_MESSAGES);
};

export const toWriteErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, WRITE_ERROR_MESSAGES);
