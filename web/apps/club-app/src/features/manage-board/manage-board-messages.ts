import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const BOARD_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Der Vorstand konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

const IMPLIED_ROLE_OPTIONS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Die Rollen haben den Server nicht erreicht. Prüfe deine Verbindung.',
  unexpected: 'Die Rollen konnten nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

export const toBoardErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, BOARD_ERROR_MESSAGES);

export const toImpliedRoleOptionsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, IMPLIED_ROLE_OPTIONS_ERROR_MESSAGES);
