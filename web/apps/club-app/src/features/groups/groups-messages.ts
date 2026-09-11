import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const GROUPS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Die Gruppen haben den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Da ist etwas schiefgelaufen. Bitte versuch es gleich noch einmal.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

const GROUP_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Diese Gruppe hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Da ist etwas schiefgelaufen. Bitte versuch es gleich noch einmal.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toGroupsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, GROUPS_ERROR_MESSAGES);

export const toGroupErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return null;
  }

  return toQueryErrorMessage(error, GROUP_ERROR_MESSAGES);
};
