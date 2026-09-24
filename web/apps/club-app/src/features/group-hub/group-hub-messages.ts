import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const HUB_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Diese Gruppe konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

const PERSON_SEARCH_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Suche ist fehlgeschlagen. Versuche es erneut.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toHubErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return null;
  }

  return toQueryErrorMessage(error, HUB_ERROR_MESSAGES);
};

export const toPersonSearchErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, PERSON_SEARCH_ERROR_MESSAGES);

const EDITOR_CHOICES_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Die Auswahllisten haben den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Die Auswahllisten konnten nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toEditorChoicesErrorMessage = (error: Error): string =>
  toQueryErrorMessage(error, EDITOR_CHOICES_ERROR_MESSAGES) ??
  EDITOR_CHOICES_ERROR_MESSAGES.unexpected;
