import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const HUB_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Diese Gruppe hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Da ist etwas schiefgelaufen. Bitte versuch es gleich noch einmal.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toHubErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return null;
  }

  return toQueryErrorMessage(error, HUB_ERROR_MESSAGES);
};
