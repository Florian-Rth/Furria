import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const CLUB_HUB_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Der Verein konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toClubHubErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, CLUB_HUB_ERROR_MESSAGES);
