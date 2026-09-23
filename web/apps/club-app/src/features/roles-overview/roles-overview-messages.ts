import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const ROLES_OVERVIEW_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Rollen konnten nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toRolesOverviewErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, ROLES_OVERVIEW_ERROR_MESSAGES);
