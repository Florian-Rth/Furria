import { RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const MANAGE_HUB_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Verwaltung konnte nicht geladen werden.',
  rejected: 'Dir fehlt die Berechtigung für diese Seite.',
};

export const toManageHubErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, MANAGE_HUB_ERROR_MESSAGES);

const CONFLICT_STATUS = 409;

const TO_DO_MARK_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Das ist inzwischen erledigt oder konnte nicht gespeichert werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

const TO_DO_CHANGED_MESSAGE = 'Inzwischen hat sich etwas geändert – schau es dir noch einmal an.';

const isConflict = (error: Error | null): boolean =>
  (error instanceof RequestFailedError || error instanceof ServerFailureError) &&
  error.status === CONFLICT_STATUS;

export const toToDoMarkErrorMessage = (error: Error | null): string | null =>
  isConflict(error) ? TO_DO_CHANGED_MESSAGE : toQueryErrorMessage(error, TO_DO_MARK_ERROR_MESSAGES);
