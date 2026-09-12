import type { QueryErrorKind } from '@/lib/query-error';
import { isNotFoundError, toQueryErrorMessage } from '@/lib/query-error';

const WRITE_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Das hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Das hat nicht geklappt. Bitte versuch es gleich noch einmal.',
  rejected: 'Der Server hat diese Änderung nicht angenommen.',
};

const WRITE_MISSING_MESSAGE =
  'Das gibt es so nicht mehr — jemand anderes war schneller. Lade die Seite neu.';

export const toWriteErrorMessage = (error: Error | null): string | null => {
  if (isNotFoundError(error)) {
    return WRITE_MISSING_MESSAGE;
  }

  return toQueryErrorMessage(error, WRITE_ERROR_MESSAGES);
};
