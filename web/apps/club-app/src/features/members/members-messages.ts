import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const MEMBERS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Die Mitgliederliste hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Die Mitgliederliste konnte nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

const MEMBER_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Diese Person hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Diese Person konnte nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toMembersErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, MEMBERS_ERROR_MESSAGES);

export const toMemberErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return null;
  }

  return toQueryErrorMessage(error, MEMBER_ERROR_MESSAGES);
};
