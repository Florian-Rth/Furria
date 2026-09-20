import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const ANNOUNCEMENTS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Der Aushang hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Die Aushänge konnten nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toAnnouncementsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, ANNOUNCEMENTS_ERROR_MESSAGES);
