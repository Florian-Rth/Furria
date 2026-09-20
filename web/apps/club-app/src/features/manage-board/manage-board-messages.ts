import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const BOARD_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Der Vorstand hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Der Vorstand konnte nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toBoardErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, BOARD_ERROR_MESSAGES);
