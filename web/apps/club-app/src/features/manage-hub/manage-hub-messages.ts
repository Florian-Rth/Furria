import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const MANAGE_HUB_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Die Verwaltung hat den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Die Verwaltung konnte nicht geladen werden.',
  rejected: 'Diese Seite ist an eine Rolle gebunden. Du hast sie gerade nicht.',
};

export const toManageHubErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, MANAGE_HUB_ERROR_MESSAGES);
