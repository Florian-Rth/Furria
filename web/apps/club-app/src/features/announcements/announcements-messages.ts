import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const ANNOUNCEMENTS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Aushänge konnten nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toAnnouncementsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, ANNOUNCEMENTS_ERROR_MESSAGES);
