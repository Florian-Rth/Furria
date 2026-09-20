import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const CLUB_HUB_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Der Verein hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Der Verein konnte nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toClubHubErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, CLUB_HUB_ERROR_MESSAGES);
