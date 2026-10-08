import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const MANAGE_HUB_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Verwaltung konnte nicht geladen werden.',
  rejected: 'Dir fehlt die Berechtigung für diese Seite.',
};

export const toManageHubErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, MANAGE_HUB_ERROR_MESSAGES);
