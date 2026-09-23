import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const MEMBERS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Mitgliederliste konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

const MEMBER_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Diese Person konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toMembersErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, MEMBERS_ERROR_MESSAGES);

export const toMemberErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return null;
  }

  return toQueryErrorMessage(error, MEMBER_ERROR_MESSAGES);
};
