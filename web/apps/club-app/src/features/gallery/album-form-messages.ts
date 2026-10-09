import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const ALBUM_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Das ließ sich nicht laden. Bitte versuche es erneut.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toAlbumErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, ALBUM_ERROR_MESSAGES);
