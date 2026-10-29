import type { QueryErrorKind } from '@/lib/query-error';

export const ACTS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Auftritte konnten nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};
