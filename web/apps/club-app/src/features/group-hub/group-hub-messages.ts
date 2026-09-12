import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const HUB_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Diese Gruppe hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Diese Gruppe konnte nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

const PERSON_SEARCH_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Die Suche hat den Server nicht erreicht. Prüfe deine Verbindung.',
  unexpected: 'Die Suche geht gerade nicht. Versuch es gleich noch einmal.',
  rejected: 'Die Suche hat der Server nicht angenommen.',
};

export const toHubErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return null;
  }

  return toQueryErrorMessage(error, HUB_ERROR_MESSAGES);
};

export const toPersonSearchErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, PERSON_SEARCH_ERROR_MESSAGES);
