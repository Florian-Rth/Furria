import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const LIST_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Beitrittsanträge konnten nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

const DETAIL_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Der Beitrittsantrag konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toMembershipApplicationsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, LIST_ERROR_MESSAGES);

export const toMembershipApplicationErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, DETAIL_ERROR_MESSAGES);
