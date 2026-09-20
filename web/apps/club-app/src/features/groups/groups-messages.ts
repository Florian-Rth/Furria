import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const GROUPS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Die Gruppen haben den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Die Gruppen konnten nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toGroupsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, GROUPS_ERROR_MESSAGES);
