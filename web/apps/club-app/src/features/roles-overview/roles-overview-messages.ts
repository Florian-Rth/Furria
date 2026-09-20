import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const ROLES_OVERVIEW_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Die Rollen haben den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Die Rollen konnten nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toRolesOverviewErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, ROLES_OVERVIEW_ERROR_MESSAGES);
