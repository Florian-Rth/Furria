import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorKind } from '@/lib/query-error';

const OVERVIEW_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Die Übersicht hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Da ist etwas schiefgelaufen. Bitte versuch es gleich noch einmal.',
};

export const toOverviewErrorMessage = (error: Error | null): string | null => {
  const kind = toQueryErrorKind(error);

  if (kind === null) {
    return null;
  }

  return OVERVIEW_ERROR_MESSAGES[kind];
};
