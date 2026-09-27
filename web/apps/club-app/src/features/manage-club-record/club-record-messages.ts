import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const CLUB_RECORD_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Vereinsdaten konnten nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toClubRecordErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, CLUB_RECORD_ERROR_MESSAGES);
