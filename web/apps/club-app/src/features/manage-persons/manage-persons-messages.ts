import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const PERSONS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Das Register hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Das Personenregister konnte nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

const PERSON_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Diese Person hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Diese Person konnte nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

const WRITE_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Das hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Das hat nicht geklappt. Bitte versuch es gleich noch einmal.',
  rejected: 'Der Server hat diese Änderung nicht angenommen.',
};

export const toPersonsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, PERSONS_ERROR_MESSAGES);

export const toPersonErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return null;
  }

  return toQueryErrorMessage(error, PERSON_ERROR_MESSAGES);
};

export const toWriteErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, WRITE_ERROR_MESSAGES);
