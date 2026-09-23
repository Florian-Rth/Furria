import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const WRITE_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Das hat nicht funktioniert. Bitte versuche es erneut.',
  rejected: 'Der Server hat die Änderung abgelehnt.',
};

const WRITE_MISSING_MESSAGE = 'Dieser Eintrag wurde inzwischen geändert. Lade die Seite neu.';

export const toWriteErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return WRITE_MISSING_MESSAGE;
  }

  return toQueryErrorMessage(error, WRITE_ERROR_MESSAGES);
};
