import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

const PROFILE_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Dein Profil konnte nicht geladen werden.',
  rejected: 'Der Server hat die Änderung abgelehnt.',
};

const GROUPS_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable:
    'Deine Gruppen haben den Server nicht erreicht. Prüfe deine Verbindung und versuch es noch einmal.',
  unexpected: 'Deine Gruppen konnten nicht geladen werden.',
  rejected: 'Der Server hat diese Anfrage nicht angenommen.',
};

const VISIBILITY_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die Einstellung konnte nicht gespeichert werden. Bitte versuche es erneut.',
  rejected: 'Der Server hat die Änderung abgelehnt.',
};

export const toProfileErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, PROFILE_ERROR_MESSAGES);

export const toProfileGroupsErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, GROUPS_ERROR_MESSAGES);

export const toVisibilityErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, VISIBILITY_ERROR_MESSAGES);
